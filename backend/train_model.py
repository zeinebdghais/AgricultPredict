import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_squared_error
from lightgbm import LGBMRegressor

print("Chargement du dataset...")
df = pd.read_csv("crop_yield.csv")
# print(df.head())

TARGET = "Yield_tons_per_hectare"
X = df.drop(columns=[TARGET])
y = df[TARGET]

categorical_cols = X.select_dtypes(include=["object", "bool"]).columns.tolist()
numeric_cols = X.select_dtypes(include=["int64", "float64"]).columns.tolist()

print("\n Colonnes catégorielles :", categorical_cols)
print(" Colonnes numériques :", numeric_cols)

# Préprocesseur
preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
        ("num", "passthrough", numeric_cols)
    ]
)

# Modèle LightGBM
model = LGBMRegressor(
    n_estimators=400,
    learning_rate=0.05,
    max_depth=-1,
    subsample=0.9,
    colsample_bytree=0.9,
    random_state=42
)

pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ]
)

# Cross Validation 5-Fold
print("\n Cross Validation en cours (k=5)...")
kf = KFold(n_splits=5, shuffle=True, random_state=42)

scores_r2 = cross_val_score(pipeline, X, y, cv=kf, scoring="r2")
scores_rmse = np.sqrt(-cross_val_score(pipeline, X, y,
                      cv=kf, scoring="neg_mean_squared_error"))

print("\n Résultats Cross Validation :")
print("R² Scores :", scores_r2)
print("RMSE Scores :", scores_rmse)

print("\n Moyenne R² :", scores_r2.mean())
print(" Moyenne RMSE :", scores_rmse.mean())

# Entraînement final sur tout le dataset
print("\n Entraînement final du modèle sur tout le dataset...")
pipeline.fit(X, y)
print("✓ Entraînement terminé")

# Sauvegarde du modèle
print("\n Sauvegarde du modèle...")

joblib.dump(pipeline, "model.pkl")
print("✓ Modèle sauvegardé sous : model.pkl")
