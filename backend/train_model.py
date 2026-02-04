import numpy as np
import pandas as pd
import tensorflow as tf

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Input
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.utils import to_categorical

# =========================
# 1. LOAD DATASET
# =========================
# CSV format:
# col0 ... col62 -> hand landmarks (x,y,z * 21)
# last column -> label (gesture name)

data = pd.read_csv("dataset/sign_data.csv")

X = data.iloc[:, :-1].values   # 63 features
y = data.iloc[:, -1].values   # labels

print("✅ Dataset loaded")
print("Feature shape:", X.shape)
print("Labels found:", set(y))

# =========================
# 2. LABEL ENCODING
# =========================
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)
y_encoded = to_categorical(y_encoded)

num_classes = y_encoded.shape[1]
print("✅ Number of classes:", num_classes)

# =========================
# 3. TRAIN-TEST SPLIT
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42
)

# =========================
# 4. MODEL DEFINITION (FIXED)
# =========================
model = Sequential([
    Input(shape=(63,)),
    Dense(128, activation='relu'),
    Dense(64, activation='relu'),
    Dense(num_classes, activation='softmax')  # 🔥 AUTO-FIXED
])

# =========================
# 5. COMPILE MODEL
# =========================
model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# =========================
# 6. TRAIN MODEL
# =========================
model.fit(
    X_train,
    y_train,
    epochs=25,
    validation_data=(X_test, y_test)
)

# =========================
# 7. SAVE MODEL
# =========================
model.save("model/sign_model.h5")

print("✅ Training complete.")
print("✅ Model saved to backend/model/sign_model.h5")
