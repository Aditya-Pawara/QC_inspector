
import os
import sys
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

load_dotenv(override=True)
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    sys.exit(1)

model_name = "gemini-2.0-flash"
print(f"Testing {model_name}...")
try:
    llm = ChatGoogleGenerativeAI(model=model_name, google_api_key=api_key)
    print(llm.invoke("Hi").content)
except Exception as e:
    print(f"{model_name} Error: {e}")
