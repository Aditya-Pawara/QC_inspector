
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("No API key")
    exit(1)

genai.configure(api_key=api_key)

try:
    with open("available_models.txt", "w") as f:
        print("Listing models...")
        for m in genai.list_models():
            f.write(f"{m.name}\n")
            if 'generateContent' in m.supported_generation_methods:
                print(m.name)
    print("Done listing.")
except Exception as e:
    print(f"Error listing models: {e}")
