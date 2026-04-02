import os
import sys
from dotenv import load_dotenv
import google.generativeai as genai

# Add app to path
sys.path.append(os.getcwd())

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

print(f"Python version: {sys.version}")
print(f"Gemini API Key found: {bool(api_key)}")

if not api_key:
    print("Error: GEMINI_API_KEY not found in .env")
    sys.exit(1)

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-flash-latest')
    response = model.generate_content("Say 'Gemini is ready!' if you can hear me.")
    print(f"Response: {response.text}")
    print("Gemini API check: SUCCESS")
except Exception as e:
    print(f"Gemini API check: FAILED - {e}")
