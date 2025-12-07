import requests
import sys

try:
    # Use the staff credentials we created in populate_demo_data.py
    # Staff: dr_smith / password123
    response = requests.post("http://127.0.0.1:8000/api/login/", json={
        "username": "dr_smith", 
        "password": "password123"
    })
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("Response JSON keys:", data.keys())
        print(f"is_provider: {data.get('is_provider')}")
        print(f"is_staff: {data.get('is_staff')}")
        
        if data.get('is_provider') is True:
            print("SUCCESS: Backend is returning is_provider=True")
        else:
            print("FAILURE: Backend returned is_provider=False or None")
    else:
        print(f"Login Failed: {response.text}")

except Exception as e:
    print(f"Error: {e}")
