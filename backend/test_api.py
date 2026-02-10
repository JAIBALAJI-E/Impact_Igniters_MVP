import requests
import json

try:
    # Test Root Endpoint
    print("Testing Root Endpoint...")
    response = requests.get("http://127.0.0.1:8000/")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Test Prediction Endpoint with dummy data
    print("\nTesting Prediction Endpoint...")
    data = {"landmarks": [0.0] * 126}
    response = requests.post("http://127.0.0.1:8000/predict-sign", json=data)
    print(f"Prediction Status Code: {response.status_code}")
    if response.status_code != 200:
        print(f"Prediction Error Text: {response.text}")
    else:
        print(f"Prediction Response: {response.json()}")

except Exception as e:
    print(f"Error: {e}")
