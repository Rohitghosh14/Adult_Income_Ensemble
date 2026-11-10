"""FastAPI backend for Adult Income prediction."""

from contextlib import asynccontextmanager
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# ── Pydantic schema ────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    age: int
    workclass: str
    education_num: int = Field(alias="education-num")
    marital_status: str = Field(alias="marital-status")
    occupation: str
    relationship: str
    capital_gain: int = Field(alias="capital-gain")
    capital_loss: int = Field(alias="capital-loss")
    hours_per_week: int = Field(alias="hours-per-week")
    native_country: str = Field(alias="native-country")

    model_config = {"populate_by_name": True}


class PredictResponse(BaseModel):
    probability: float
    prediction: str
    threshold: float


# ── App lifespan (load model once) ─────────────────────────────────────────
ml_artifacts: dict = {}


PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = PROJECT_ROOT / "models" / "adult_hgb.joblib"


@asynccontextmanager
async def lifespan(app: FastAPI):
    blob = joblib.load(MODEL_PATH)
    ml_artifacts["model"] = blob["model"]
    ml_artifacts["threshold"] = blob["threshold"]
    yield
    ml_artifacts.clear()


app = FastAPI(title="Adult Income Predictor", lifespan=lifespan)

# ── CORS ───────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Column order expected by the pipeline ──────────────────────────────────
COLUMN_ORDER = [
    "age", "workclass", "fnlwgt", "education", "education-num",
    "marital-status", "occupation", "relationship", "race", "sex",
    "capital-gain", "capital-loss", "hours-per-week", "native-country",
]


# ── Routes ─────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):
    model = ml_artifacts["model"]
    threshold = ml_artifacts["threshold"]

    row = pd.DataFrame(
        [
            {
                "age": req.age,
                "workclass": req.workclass,
                "fnlwgt": 189000,
                "education": "Bachelors",
                "education-num": req.education_num,
                "marital-status": req.marital_status,
                "occupation": req.occupation,
                "relationship": req.relationship,
                "race": "Missing",
                "sex": "Missing",
                "capital-gain": req.capital_gain,
                "capital-loss": req.capital_loss,
                "hours-per-week": req.hours_per_week,
                "native-country": req.native_country,
            }
        ],
        columns=COLUMN_ORDER,
    )

    probability = float(model.predict_proba(row)[0, 1])
    prediction = ">50K" if probability >= threshold else "<=50K"

    return PredictResponse(
        probability=probability,
        prediction=prediction,
        threshold=threshold,
    )
