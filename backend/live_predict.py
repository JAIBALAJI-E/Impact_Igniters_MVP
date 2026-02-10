import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp


model = tf.keras.models.load_model("model/sign_model.h5")

<<<<<<< HEAD
LABELS = [
    "ABSOLUTE CINEMA", "COME", "FINE", "GO", "HELLO", "HELP", "HERE", "Hello", "LATER", "NO", "OK",
    "OKAY", "PEACE", "PLEASE", "STOP", "THANK YOU", "WATER", "WELCOME", "WHAT", "YES", "YOU"
]  
=======
LABELS = ["HELLO", "THANK YOU", "YES", "NO"]  
>>>>>>> ae361e2be083bbf9491a19462e853bfc50e01487

CONFIDENCE_THRESHOLD = 0.75  

#MEDIAPIPE SETUP

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)
mp_draw = mp.solutions.drawing_utils

#webcam

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

<<<<<<< HEAD
    if result.multi_hand_landmarks and result.multi_handedness:
        lh = np.zeros(63)
        rh = np.zeros(63)
        
        for idx, hand_landmarks in enumerate(result.multi_hand_landmarks):
            hand_label = result.multi_handedness[idx].classification[0].label
            landmarks = []
            for lm in hand_landmarks.landmark:
                landmarks.extend([lm.x, lm.y, lm.z])
            
            if hand_label == "Left":
                lh = np.array(landmarks)
=======
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

           
            if confidence >= CONFIDENCE_THRESHOLD and class_id < len(LABELS):
                prediction_text = LABELS[class_id]
>>>>>>> ae361e2be083bbf9491a19462e853bfc50e01487
            else:
                rh = np.array(landmarks)

            mp_draw.draw_landmarks(
                frame,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS
            )
        
        # Combine to 126 features
        data = np.concatenate([lh, rh]).reshape(1, 126)

        prediction = model.predict(data, verbose=0)[0]
        class_id = int(np.argmax(prediction))
        confidence = prediction[class_id]

        if confidence >= CONFIDENCE_THRESHOLD and class_id < len(LABELS):
            prediction_text = LABELS[class_id]
        else:
            prediction_text = "No sign detected"

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

    
    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()
