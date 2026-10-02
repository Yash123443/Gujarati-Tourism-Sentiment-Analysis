"""
Gujarati Tourism Sentiment Analysis - FastAPI Backend
Loads fine-tuned XLM-RoBERTa model once at startup and serves predictions.
"""

import os
import re
import json
import logging
from pathlib import Path
from contextlib import asynccontextmanager

import torch
import torch.nn.functional as F
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Model path – resolve relative to this file so the backend can be run from
# any working directory.
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # NPL main/
MODEL_DIR = BASE_DIR / "results" / "xlm_roberta_finetuned"

# ---------------------------------------------------------------------------
# Text pre-processing — mirrors the cleaning used during training
# (remove URLs, @mentions, normalize whitespace)
# ---------------------------------------------------------------------------
_URL_RE  = re.compile(r"https?://\S+|www\.\S+")
_AT_RE   = re.compile(r"@\w+")
_WS_RE   = re.compile(r"\s+")

def clean_text(text: str) -> str:
    """Light cleaning that matches the training preprocessing pipeline."""
    text = _URL_RE.sub(" ", text)
    text = _AT_RE.sub(" ", text)
    text = _WS_RE.sub(" ", text)
    return text.strip()


# ---------------------------------------------------------------------------
# Global model state
# ---------------------------------------------------------------------------
_state: dict = {}


# ---------------------------------------------------------------------------
# Lifespan: load model once at startup
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Guard: fail fast with a clear message if the model folder is absent ──
    if not MODEL_DIR.exists():
        raise RuntimeError(
            f"Model directory not found: {MODEL_DIR}\n"
            "Make sure 'results/xlm_roberta_finetuned/' exists relative to the "
            "project root and contains model.safetensors, config.json, and tokenizer.json."
        )

    logger.info("Loading tokenizer from %s …", MODEL_DIR)
    tokenizer = AutoTokenizer.from_pretrained(str(MODEL_DIR), local_files_only=True)

    logger.info("Loading model from %s …", MODEL_DIR)
    model = AutoModelForSequenceClassification.from_pretrained(
        str(MODEL_DIR), local_files_only=True
    )
    model.eval()

    # Read id2label from config.json for safety
    config_path = MODEL_DIR / "config.json"
    with open(config_path, "r", encoding="utf-8") as f:
        cfg = json.load(f)
    id2label: dict[str, str] = {int(k): v for k, v in cfg["id2label"].items()}

    _state["tokenizer"] = tokenizer
    _state["model"] = model
    _state["id2label"] = id2label
    logger.info("Model ready. Labels: %s", id2label)

    yield  # application runs here

    _state.clear()
    logger.info("Model unloaded.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Gujarati Tourism Sentiment Analysis API",
    description="Fine-tuned XLM-RoBERTa sentiment classifier for Gujarati / English / Mixed tourism reviews.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class PredictRequest(BaseModel):
    text: str


class ClassScore(BaseModel):
    label: str
    score: float


class PredictResponse(BaseModel):
    label: str
    confidence: float          # 0-100 percentage
    scores: list[ClassScore]   # all three class probabilities


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/api/health")
async def health():
    """Simple health-check endpoint."""
    model_loaded = "model" in _state
    return {
        "status": "ok" if model_loaded else "loading",
        "model_loaded": model_loaded,
        "model_dir": str(MODEL_DIR),
    }


@app.post("/api/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):
    """Predict sentiment for a tourism review."""
    text = clean_text(req.text)
    if not text:
        raise HTTPException(status_code=422, detail="Text must not be empty.")

    tokenizer = _state["tokenizer"]
    model = _state["model"]
    id2label = _state["id2label"]

    # max_length=128 matches MAXLEN used during fine-tuning
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=128,
        padding=True,
    )

    with torch.no_grad():
        outputs = model(**inputs)

    probs = F.softmax(outputs.logits, dim=-1).squeeze()  # (num_labels,)

    predicted_idx = int(torch.argmax(probs).item())
    predicted_label = id2label[predicted_idx]
    confidence = float(probs[predicted_idx].item()) * 100

    all_scores = [
        ClassScore(label=id2label[i], score=round(float(probs[i].item()), 6))
        for i in range(len(id2label))
    ]

    logger.info(
        'Prediction: "%s…" → %s (%.1f%%)',
        text[:60],
        predicted_label,
        confidence,
    )

    return PredictResponse(
        label=predicted_label,
        confidence=round(confidence, 2),
        scores=all_scores,
    )
