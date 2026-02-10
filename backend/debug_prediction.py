import sys
import os
import numpy as np

# Add current directory to path
sys.path.append(os.getcwd())

try:
    from main import predict_sign, LandmarkInput
    
    print("Successfully imported main")
    
    # Create dummy data
    data = LandmarkInput(landmarks=[0.0] * 126)
    
    print("Running prediction...")
    arr = np.array(data.landmarks).reshape(1, 126)
    from main import model
    prediction = model.predict(arr, verbose=0)[0]
    print(f"Prediction shape: {prediction.shape}")
    print(f"Number of LABELS in main.py: 20") # Hardcoded from what I saw
    
    # Run the original function to trigger error or checking
    result = predict_sign(data)
    print("Result:", result)

except Exception as e:
    import traceback
    traceback.print_exc()
