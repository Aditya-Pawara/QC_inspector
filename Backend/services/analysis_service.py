import os
import json
import base64
import mimetypes
import re
from typing import Dict, Any, List
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv

load_dotenv(override=True)

class AnalysisService:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        # Default client setup (can be reused if needed)
        self.default_model = "gemini-1.5-flash"
        
        self.models = [
            "gemini-2.0-flash",
            "gemini-2.0-flash-lite", 
            "gemini-1.5-flash",
            "gemini-1.5-flash-8b",
            "gemini-1.5-pro",
            "gemini-2.5-flash", # Added based on availability
        ]

    async def _try_analyze_with_model(self, model_name: str, message: HumanMessage) -> str:
        """Helper to try analysis with a specific model."""
        print(f"Aligning with model: {model_name}...")
        try:
            # Create a localized LLM for this attempt
            llm = ChatGoogleGenerativeAI(
                model=model_name,
                google_api_key=self.api_key,
                temperature=0.2,
                max_retries=0, 
            )
            response = await llm.ainvoke([message])
            
            # Additional safety: handle if response itself is a list (unlikely but possible with some configurations)
            if isinstance(response, list):
                print(f"Warning: Model {model_name} returned a LIST of responses. Using first element.")
                if len(response) > 0:
                    response = response[0]
                else:
                    raise ValueError("Model returned empty list response")
            
            if not hasattr(response, 'content'):
                 raise ValueError(f"Model response {type(response)} has no 'content' attribute")

            
            # Debugging: Print usage metadata if available
            try:
                if hasattr(response, 'usage_metadata'):
                     print(f"Token usage: {response.usage_metadata}")
            except Exception:
                pass
            
            # Handle case where content is a list (e.g., multimodal parts)
            try:
                content = response.content
            except AttributeError:
                # If response is a list or doesn't have content, try to use it directly or stringify
                print(f"Warning: Response {type(response)} has no content attribute. Using str().")
                content = str(response)
            if isinstance(content, list):
                print(f"Warning: Model {model_name} returned LIST content. Joining...")
                # It might be a list of strings or list of dicts/objects
                text_parts = []
                for part in content:
                    if isinstance(part, str):
                        text_parts.append(part)
                    elif hasattr(part, 'text'):
                        text_parts.append(part.text)
                    else:
                        text_parts.append(str(part))
                return "".join(text_parts)
                
            return str(content)
        except Exception as e:
            # Re-raise to be caught by caller
            raise e

    def _sanitize_json_string(self, json_str: str) -> str:
        """
        Cleans the string to ensure it's valid JSON.
        Removes markdown code blocks and finds the JSON object.
        """
        # Remove markdown code blocks if present
        if "```json" in json_str:
            json_str = json_str.replace("```json", "").replace("```", "")
        elif "```" in json_str:
            json_str = json_str.replace("```", "")
        
        # Find the first opening brace and last closing brace
        match = re.search(r'\{[\s\S]*\}', json_str)
        if match:
            return match.group(0)
        return json_str

    def _validate_and_fix_structure(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ensures the parsed JSON has the expected structure.
        Fills in missing fields with default values.
        """
        defaults = {
            "defects": [],
            "severity_breakdown": {
                "critical": 0,
                "high": 0,
                "medium": 0,
                "low": 0
            },
            "overall_severity": "Low", # Default safe (or Unknown)
            "quality_issues": [],
            "recommendations": []
        }

        if isinstance(data, list):
            if len(data) > 0 and isinstance(data[0], dict):
                # If it's a list of dicts, take the first one (most common hallucination)
                data = data[0]
            else:
                # If it's an empty list or list of non-dicts, return defaults
                print("Warning: Gemini returned a list instead of a dict. Using default structure.")
                return defaults
        
        # Final safety check: if data is still not a dict (e.g., None, string, boolean), return defaults
        if not isinstance(data, dict):
             print(f"Warning: Analysis returned {type(data)} instead of dict. Using defaults.")
             return defaults

        # helper to safely get nested dict
        if not isinstance(data.get("severity_breakdown"), dict):
            data["severity_breakdown"] = defaults["severity_breakdown"]
        else:
            # Ensure all keys exist in severity_breakdown
            for key in defaults["severity_breakdown"]:
                if key not in data["severity_breakdown"]:
                    data["severity_breakdown"][key] = 0

        # Ensure lists are lists
        for list_field in ["defects", "quality_issues", "recommendations"]:
            if not isinstance(data.get(list_field), list):
                data[list_field] = []
        
        # Ensure overall_severity is a string
        if not isinstance(data.get("overall_severity"), str):
            data["overall_severity"] = "Unknown"

        return data

    async def analyze_image(self, image_path: str) -> Dict[str, Any]:
        """
        Analyzes the image using Gemini Vision to identify defects, severity, quality issues, and recommendations.
        Returns a structured dictionary ready for database storage.
        """
        # Determine mime type
        mime_type, _ = mimetypes.guess_type(image_path)
        if not mime_type:
            mime_type = "image/jpeg" # Default fallback
            
        print(f"Analyzing image: {image_path} with mime type: {mime_type}")

        prompt = """
        You are an expert Quality Control Inspector for manufacturing. 
        Analyze this image of a manufactured product with extreme scrutiny. 
        Look for ANY and ALL potential defects, including but not limited to:
        - Surface scratches, dents, chips, or cracks
        - Discoloration, stains, or rust
        - Misalignment, deformation, or structural irregularities
        - Foreign particles, dust, or contamination
        - Poor finish, rough edges, or coating issues
        
        Even if the defect is minor, list it. Do NOT default to "No Defects" unless the product is truly perfect.
        
        Provide a detailed analysis in the following JSON format:
        {
            "defects": [
                {"name": "Defect Name", "description": "Detailed description of the defect", "location": "Specific location on object"}
            ],
            "severity_breakdown": {
                "critical": 0,
                "high": 0,
                "medium": 0,
                "low": 0
            },
            "overall_severity": "Critical/High/Medium/Low",
            "quality_issues": ["List of general quality issues found"],
            "recommendations": ["List of actionable recommendations"]
        }
        
        IMPORTANT: Return ONLY the JSON string. No markdown formatting.
        """

        try:
            with open(image_path, "rb") as image_file:
                image_data = image_file.read()
                
            image_b64 = base64.b64encode(image_data).decode("utf-8")
            
            # Construct message with proper structure for LangChain Google integration
            message = HumanMessage(
                content=[
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url", 
                        "image_url": f"data:{mime_type};base64,{image_b64}"
                    }
                ]
            )

            print("Sending request to Gemini...")
            
            content = None
            last_error = None
            
            # Try models in sequence
            for model_name in self.models:
                try:
                    content = await self._try_analyze_with_model(model_name, message)
                    if content:
                        print(f"Success with model: {model_name}")
                        break
                except Exception as e:
                    last_error = e
                    print(f"Model {model_name} failed: {e}")
                    # If it's a structural error (not connection), maybe don't retry? 
                    # For now, continue to next model
                    continue
            
            if not content:
                print("All models failed.")
                raise last_error if last_error else Exception("All models failed to generate content")

            print(f"Gemini Raw Response (First 500 chars): {content[:500]}")
            
            # DEBUG: Save raw response to file if possible (local only)
            if not os.environ.get("VERCEL"):
                try:
                    with open("debug_response.txt", "w", encoding="utf-8") as f:
                        f.write(content)
                except Exception as e:
                    print(f"Failed to write debug file: {e}")

            # 1. Sanitize the string
            json_str = self._sanitize_json_string(content.strip())
            
            # 2. Parse JSON
            try:
                data = json.loads(json_str)
            except json.JSONDecodeError:
                # Fallback: Try ast.literal_eval for single-quoted Python dicts
                import ast
                try:
                    print("JSON load failed. Trying ast.literal_eval...")
                    data = ast.literal_eval(json_str)
                except (ValueError, SyntaxError) as e:
                    print(f"Parsing failed completely. Error: {e}")
                    raise json.JSONDecodeError("Failed to parse JSON or Python dict", json_str, 0)
            
            # 3. Validate and Structure Data
            structured_data = self._validate_and_fix_structure(data)
            
            return structured_data

        except (json.JSONDecodeError, ValueError, SyntaxError) as e:
            print(f"Parsing Error: {e}")
            print(f"Failed Content (First 500 chars): {content[:500] if content else 'None'}")
            return {
                "error": "Failed to analyze image (Parsing Error)",
                "raw_content": content,
                "defects": [],
                "severity_breakdown": {"critical": 0, "high": 0, "medium": 0, "low": 0},
                "overall_severity": "Unknown",
                "quality_issues": ["Analysis parsing failed"],
                "recommendations": []
            }
        except Exception as e:
            error_msg = str(e)
            print(f"Error during analysis: {error_msg}")
            import traceback
            traceback.print_exc()
            
            if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                user_error = "Daily Quota Exceeded. Please try again later or upgrade plan."
            elif "404" in error_msg or "NOT_FOUND" in error_msg:
                 user_error = "Model Not Found or Not Supported in Region."
            else:
                user_error = "Analysis Failed: " + error_msg[:50] + "..."

            return {
                "error": user_error,
                "defects": [],
                "severity_breakdown": {"critical": 0, "high": 0, "medium": 0, "low": 0},
                "overall_severity": "Unknown",
                "quality_issues": ["Analysis error"],
                "recommendations": []
            }
