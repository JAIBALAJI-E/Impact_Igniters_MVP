import numpy as np
import pandas as pd
import tensorflow as tf

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Input, Dropout
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.utils import to_categorical

<<<<<<< HEAD
# =========================
# 1. LOAD DATA
# =========================
data_path = "dataset/sign_data.csv"
try:
    df = pd.read_csv(data_path, header=None) 
except FileNotFoundError:
    print(f"[ERROR] Dataset not found at {data_path}")
    print("   Run 'python utils/collect_data.py' to collect data first.")
    exit()
=======

#LOAD DATASET

>>>>>>> ae361e2be083bbf9491a19462e853bfc50e01487

# Check if dataset is empty
if df.empty:
    print("[ERROR] Dataset is empty.")
    exit()

# FIX: Check if first row is header (contains strings instead of floats in feature columns)
# If the first column of the first row cannot be converted to float, assume it's a header.
# We also handle scattered headers from concatenation by coercing to numeric and dropping NaNs.

# 1. Separate Features and Labels
X_raw = df.iloc[:, :126]
y_raw = df.iloc[:, -1]

# 2. Force Features to Numeric (Coerce errors to NaN)
print("[INFO] Cleaning dataset...")
X_numeric = X_raw.apply(pd.to_numeric, errors='coerce')

# 3. Find invalid rows (any NaN in features)
valid_indices = ~X_numeric.isnull().any(axis=1)
num_dropped = len(df) - valid_indices.sum()

if num_dropped > 0:
    print(f"[WARNING] Dropped {num_dropped} invalid rows (likely headers or garbage).")

# 4. Filter Data
X = X_numeric[valid_indices].values
y = y_raw[valid_indices].astype(str).values

# Check if dataset is empty after cleaning
if len(X) == 0:
    print("[ERROR] Dataset is empty after cleaning.")
    exit()

print(f"Dataset Shape (Cleaned): {X.shape}")

<<<<<<< HEAD
# =========================
# 2. PREPROCESS LABELS
# =========================
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)
num_classes = len(np.unique(y_encoded)) # Define num_classes here!
y_categorical = to_categorical(y_encoded)
=======

#LABEL ENCODING

label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)
y_encoded = to_categorical(y_encoded)
>>>>>>> ae361e2be083bbf9491a19462e853bfc50e01487

print(f"Dataset Shape: {df.shape}")
print(f"Classes Detected: {encoder.classes_}")
print(f"Number of Classes: {num_classes}")

<<<<<<< HEAD
# =========================
# 3. SPLIT DATA
# =========================
=======

#TRAIN-TEST SPLIT

>>>>>>> ae361e2be083bbf9491a19462e853bfc50e01487
X_train, X_test, y_train, y_test = train_test_split(
    X, y_categorical, test_size=0.2, random_state=42
)

<<<<<<< HEAD
# =========================
# 4. DEFINE MODEL
# =========================
=======

#MODEL DEFINITION (FIXED)
>>>>>>> ae361e2be083bbf9491a19462e853bfc50e01487

model = Sequential([
    Input(shape=(126,)),
    Dense(128, activation='relu'),
    Dropout(0.2),
    Dense(64, activation='relu'),
<<<<<<< HEAD
    Dropout(0.2),
=======
>>>>>>> ae361e2be083bbf9491a19462e853bfc50e01487
    Dense(num_classes, activation='softmax')  
])


#COMPILE MODEL

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)


#TRAIN MODEL

model.fit(
    X_train,
    y_train,
    epochs=25,
    validation_data=(X_test, y_test)
)


#SAVE MODEL

model.save("model/sign_model.h5")

print("[INFO] Training complete.")
print("[INFO] Model saved to backend/model/sign_model.h5")
