import joblib
import pandas as pd

bundle = joblib.load("models/adult_hgb.joblib")
model, threshold = bundle["model"], bundle["threshold"]

row = pd.DataFrame([{
    "age": 39, "workclass": "State-gov", "fnlwgt": 77516,
    "education": "Bachelors", "education-num": 13,
    "marital-status": "Never-married", "occupation": "Adm-clerical",
    "relationship": "Not-in-family", "race": "White", "sex": "Male",
    "capital-gain": 2174, "capital-loss": 0, "hours-per-week": 40,
    "native-country": "United-States",
}])

proba = model.predict_proba(row)[0, 1]
print("probability of >50K:", round(proba, 3))
print("prediction:", ">50K" if proba >= threshold else "<=50K")
