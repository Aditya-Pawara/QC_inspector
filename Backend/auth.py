
import firebase_admin
from firebase_admin import auth, credentials
import os
from fastapi import Header, HTTPException, Depends
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin SDK
# Try to find credentials in this order:
# 1. GOOGLE_APPLICATION_CREDENTIALS environment variable (standard)
# 2. 'serviceAccountKey.json' in current directory
# 3. Default (for cloud run etc)

# Get the absolute path to the directory where this file (auth.py) is located
import json

# Get the absolute path to the directory where this file (auth.py) is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_KEY_PATH = os.path.join(BASE_DIR, "serviceAccountKey.json")

cred = None
if os.path.exists(SERVICE_ACCOUNT_KEY_PATH):
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
elif os.getenv("FIREBASE_SERVICE_ACCOUNT"):
    # Load credentials from environment variable (JSON string)
    try:
        service_account_info = json.loads(os.getenv("FIREBASE_SERVICE_ACCOUNT"))
        cred = credentials.Certificate(service_account_info)
    except Exception as e:
         print(f"Warning: Failed to parse FIREBASE_SERVICE_ACCOUNT: {e}")
else:
    print(f"Warning: serviceAccountKey.json not found at {SERVICE_ACCOUNT_KEY_PATH} and FIREBASE_SERVICE_ACCOUNT not set")

try:
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
except Exception as e:
    print(f"Warning: Firebase Admin failed to initialize: {e}")

async def get_current_user(authorization: str = Header(None)):
    """
    Dependency to verify Firebase ID token from Authorization header.
    Expects header format: Authorization: Bearer <token>
    Returns the user's UID if valid.
    """
    if not authorization:
        # For development/testing without frontend auth, you might want a bypass
        # But for production, this should be strict.
        # return "test_user_id" 
        raise HTTPException(status_code=401, detail="Missing Authorization Header")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization Header Format")

    token = authorization.split("Bearer ")[1]

    try:
        # Verify the ID token
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        return uid
    except Exception as e:
        print(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid or Expired Token")
