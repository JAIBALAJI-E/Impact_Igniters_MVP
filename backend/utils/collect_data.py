import cv2
import mediapipe as mp
import csv
import os

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.5
)
mp_draw = mp.solutions.drawing_utils

label = input("Enter gesture label (e.g. HELLO): ").upper()
try:
    samples = int(input("How many samples? (e.g. 200): "))
except ValueError:
    print("Invalid number. Defaulting to 200.")
    samples = 200

import numpy as np

csv_path = "../dataset/sign_data.csv"
os.makedirs("../dataset", exist_ok=True)

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("❌ Error: Could not open webcam.")
    print("👉 Suggestion: Check if the browser or another app is using the camera.")
    exit()

count = 0
collecting = False

print(f"📷 Webcam opened. Press 's' to start collecting '{label}'. Press ESC to exit.")
print("NOTE: This will continuously append to the dataset. Ensure your dataset matches the 126-feature format (Left+Right Hand).")

with open(csv_path, mode="a", newline="") as f:
    writer = csv.writer(f)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("❌ Error: Failed to read frame from webcam.")
            print("👉 Suggestion: The camera might be disconnected or used by another application.")
            break

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = hands.process(rgb)

        # Draw Interface Text
        if not collecting:
            cv2.putText(frame, f"Ready: Press 's' to collect '{label}'", (20, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        else:
            cv2.putText(frame, f"Collecting: {count}/{samples}", (20, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        # Draw Hand Detection Status
        status_text = "No Hands"
        status_color = (0, 0, 255) # Red

        if result.multi_hand_landmarks:
            num_hands = len(result.multi_hand_landmarks)
            if num_hands == 1:
                status_text = "1 Hand Detected"
                status_color = (0, 255, 255) # Yellow
            elif num_hands == 2:
                status_text = "2 Hands Detected"
                status_color = (0, 255, 0) # Green
        
        cv2.putText(frame, status_text, (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.6, status_color, 2)
        


        if result.multi_hand_landmarks and result.multi_handedness:
            # Initialize empty arrays for Left and Right hands (63 features each)
            lh = np.zeros(63)
            rh = np.zeros(63)
            hands_detected = []

            for idx, hand_landmarks in enumerate(result.multi_hand_landmarks):
                # Get handedness label (Left or Right)
                hand_label = result.multi_handedness[idx].classification[0].label
                hands_detected.append(hand_label)

                
                # Extract landmarks
                landmarks = []
                for lm in hand_landmarks.landmark:
                    landmarks.extend([lm.x, lm.y, lm.z])
                
                # Assign to correct array
                if hand_label == "Left":
                    lh = np.array(landmarks)
                else:
                    rh = np.array(landmarks)

                # Draw landmarks
                mp_draw.draw_landmarks(
                    frame, hand_landmarks, mp_hands.HAND_CONNECTIONS
                )

            # Check if we should save data
            if collecting and count < samples:
                # Combine Left + Right -> 126 features
                row = np.concatenate([lh, rh]).tolist()
                row.append(label)
                
                writer.writerow(row)
                count += 1

        cv2.imshow("Data Collection", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('s') and not collecting:
            collecting = True
            print("▶ Collection Started...")
        elif key == 27:  # ESC
            print("❌ Collection Stopped by User")
            break
            
        if collecting and count >= samples:
            print(f"✅ Collection Complete! {count} samples saved.")
            break

cap.release()
cv2.destroyAllWindows()
