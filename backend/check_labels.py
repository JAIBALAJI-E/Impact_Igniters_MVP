import pandas as pd
import numpy as np

data_path = "dataset/sign_data.csv"
try:
    df = pd.read_csv(data_path, header=None)
except FileNotFoundError:
    print("Dataset not found")
    exit()

# 1. Separate
X_raw = df.iloc[:, :126]
y_raw = df.iloc[:, -1]

# 2. Coerce
X_numeric = X_raw.apply(pd.to_numeric, errors='coerce')
valid_indices = ~X_numeric.isnull().any(axis=1)

# 3. Filter
y = y_raw[valid_indices].astype(str).values

# 4. Unique
classes = sorted(np.unique(y))
with open("labels_utf8.txt", "w", encoding="utf-8") as f:
    f.write(str(classes))
print("Classes written to labels_utf8.txt")
