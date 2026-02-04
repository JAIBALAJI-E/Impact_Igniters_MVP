from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import tensorflow as tf
from utils.morse import text_to_morse
from fastapi.middleware.cors import CORSMiddleware

# =========================
# APP SETUP
# =========================
app = FastAPI()

# 🔥 CORS FIX (MANDATORY)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# LOAD MODEL
# =========================
model = tf.keras.models.load_model("model/sign_model.h5")

# ⚠️ MUST MATCH TRAINING LABEL ORDER
LABELS = ["HELLO", "THANK YOU", "YES", "NO"]

# 🔽 DEMO MODE THRESHOLD
CONFIDENCE_THRESHOLD = 0.05

# =========================
# REQUEST SCHEMA
# =========================
class LandmarkInput(BaseModel):
    landmarks: list[float]

# =========================
# ROUTES
# =========================
@app.get("/")
def root():
    return {"status": "API running"}

@app.post("/predict-sign")
def predict_sign(data: LandmarkInput):

    # Validate landmark length
    if len(data.landmarks) != 63:
        return {
            "prediction": "No sign detected",
            "confidence": 0.0,
            "morse": ""
        }

    # Prepare input
    arr = np.array(data.landmarks).reshape(1, 63)

    # Predict
    prediction = model.predict(arr, verbose=0)[0]

    # Confidence logic
    confidence = float(np.max(prediction))
    class_id = int(np.argmax(prediction))

    # Get label safely
    if class_id < len(LABELS):
        final_label = LABELS[class_id]
    else:
        final_label = "No sign detected"

    # ✅ DEFINE morse_code HERE (THIS WAS MISSING)
    morse_code = text_to_morse(final_label)

    return {
        "prediction": final_label,
        "confidence": round(confidence, 2),
        "morse": morse_code
    }


@app.post("/morse")
def morse(text: str):
    return {"morse": text_to_morse(text)}
