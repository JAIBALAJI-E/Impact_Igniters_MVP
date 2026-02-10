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
LABELS = [
    "ABSOLUTE CINEMA", "COME", "FINE", "GO", "HELLO", "HELP", "HERE", "Hello", "LATER", "NO", "OK",
    "OKAY", "PEACE", "PLEASE", "STOP", "THANK YOU", "WATER", "WELCOME", "WHAT", "YES", "YOU"
]

# 🔽 DEMO MODE THRESHOLD
CONFIDENCE_THRESHOLD = 0.50

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
    if len(data.landmarks) != 126:
        return {
            "prediction": "No sign detected",
            "confidence": 0.0,
            "morse": "",
            "best_guess": "No sign detected"
        }

    # Prepare input
    arr = np.array(data.landmarks).reshape(1, 126)

    # Predict
    prediction = model.predict(arr, verbose=0)[0]

    # 1. Get RAW Confidence (Max Softmax Probability) - STRICTLY BEFORE MERGING
    raw_best_conf = float(np.max(prediction))
    raw_best_idx = np.argmax(prediction)
    raw_best_label = LABELS[raw_best_idx]

    # 2. Aggregate synonyms (Merge Hello->HELLO, OKAY->OK) for the final label check
    scores = {}
    for i, prob in enumerate(prediction):
        label = LABELS[i]
        if label == "Hello": label = "HELLO"
        if label == "OKAY": label = "OK"
        scores[label] = scores.get(label, 0.0) + float(prob)

    # Find best match after merging
    if scores:
        merged_best_label = max(scores, key=scores.get)
        merged_best_conf = scores[merged_best_label]
    else:
        merged_best_label = "No sign detected"
        merged_best_conf = 0.0

    # 3. Final decision based on RAW threshold
    # The requirement is to use the max softmax probability for confidence
    if raw_best_conf >= CONFIDENCE_THRESHOLD:
        final_label = merged_best_label
        confidence = raw_best_conf # Display the raw confidence
    else:
        final_label = "No sign detected"
        confidence = raw_best_conf  # Return actual low confidence for UI feedback

    # ✅ DEFINE morse_code HERE
    morse_code = text_to_morse(final_label) if final_label != "No sign detected" else ""

    return {
        "prediction": final_label,
        "confidence": round(confidence, 2),
        "morse": morse_code,
        "best_guess": merged_best_label # Always return the best guess for UI feedback
    }


@app.post("/morse")
def morse(text: str):
    return {"morse": text_to_morse(text)}
