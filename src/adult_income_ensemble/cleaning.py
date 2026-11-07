import numpy as np


def clean_adult(X):
    X = X.copy()
    text_cols = X.select_dtypes(include=["object", "category", "string"]).columns
    for col in text_cols:
        X[col] = X[col].astype("object").str.strip().replace("?", np.nan)
    return X
