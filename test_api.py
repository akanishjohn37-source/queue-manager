import requests
import sys

try:
    print("Testing connection to http://127.0.0.1:8000/api/providers/")
    response = requests.get("http://127.0.0.1:8000/api/providers/")
    print(f"Status Code: {response.status_code}")
    print(f"Content: {response.text[:500]}")
except Exception as e:
    print(f"Error: {e}")
