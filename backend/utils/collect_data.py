import cv2
import mediapipe as mp
import csv
import os

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
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

csv_path = "../dataset/sign_data.csv"
os.makedirs("../dataset", exist_ok=True)

cap = cv2.VideoCapture(0)
count = 0
collecting = False

print(f"📷 Webcam opened. Press 's' to start collecting '{label}'. Press ESC to exit.")

with open(csv_path, mode="a", newline="") as f:
    writer = csv.writer(f)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
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

        if result.multi_hand_landmarks:
            for hand_landmarks in result.multi_hand_landmarks:
                mp_draw.draw_landmarks(
                    frame, hand_landmarks, mp_hands.HAND_CONNECTIONS
                )
                
                if collecting and count < samples:
                    row = []
                    for lm in hand_landmarks.landmark:
                        row.extend([lm.x, lm.y, lm.z])
                    
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
