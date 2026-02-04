import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp

# =========================
# LOAD MODEL
# =========================
model = tf.keras.models.load_model("model/sign_model.h5")

# ⚠️ MUST MATCH TRAINING LABEL ORDER
LABELS = ["HELLO", "THANK YOU", "YES", "NO"]  # update if needed

CONFIDENCE_THRESHOLD = 0.75  # 👈 adjust if needed

# =========================
# MEDIAPIPE SETUP
# =========================
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)
mp_draw = mp.solutions.drawing_utils

# =========================
# START WEBCAM
# =========================
cap = cv2.VideoCapture(0)

print("✅ Running live sign recognition")
print("👉 Press ESC to stop")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)

    prediction_text = "No sign detected"

    if result.multi_hand_landmarks:
        hand_landmarks = result.multi_hand_landmarks[0]

        landmarks = []
        for lm in hand_landmarks.landmark:
            landmarks.extend([lm.x, lm.y, lm.z])

        if len(landmarks) == 63:
            data = np.array(landmarks).reshape(1, 63)

            prediction = model.predict(data, verbose=0)[0]
            class_id = int(np.argmax(prediction))
            confidence = prediction[class_id]

            # ✅ SAFE CHECK
            if confidence >= CONFIDENCE_THRESHOLD and class_id < len(LABELS):
                prediction_text = LABELS[class_id]
            else:
                prediction_text = "No sign detected"

        mp_draw.draw_landmarks(
            frame,
            hand_landmarks,
            mp_hands.HAND_CONNECTIONS
        )

    cv2.putText(
        frame,
        f"Prediction: {prediction_text}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )

    cv2.imshow("Sign Language Recognition", frame)

    # 🔴 STOP ONLY WHEN YOU PRESS ESC
    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()
