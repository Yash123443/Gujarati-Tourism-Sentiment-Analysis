# Gujarati Tourism Sentiment Analysis

A full-stack web demo that classifies Gujarat tourism reviews as **Positive**, **Neutral**, or **Negative**. It supports Gujarati, English, and code-mixed text using a fine-tuned XLM-RoBERTa model.

## Highlights

- Fine-tuned `xlm-roberta-base` deployed through FastAPI
- React + Vite interface with a project overview and live analyzer
- Predictions include a sentiment label, confidence, and probabilities for every class
- 5-fold cross-validation accuracy: **96.06%**
- Training dataset: **1,498** Gujarat tourism reviews

## Architecture

```text
React + Vite frontend (port 5173)
          │
          ▼
FastAPI prediction API (port 8000)
          │
          ▼
Fine-tuned XLM-R model in results/xlm_roberta_finetuned/
```

## Repository layout

```text
.
├── app/
│   ├── backend/
│   │   ├── main.py
│   │   └── requirements.txt
│   └── frontend/
│       ├── src/
│       ├── package.json
│       └── vite.config.js
├── results/
│   └── xlm_roberta_finetuned/   # deployed model and tokenizer
├── tourism_reviews_dataset_expanded.csv
└── Gujarati_Tourism_Sentiment_Analysis.ipynb
```

## Requirements

- Python 3.10 or later
- Node.js 18 or later
- Git LFS (required because the model weights are large)

## Clone the project

```bash
git lfs install
git clone https://github.com/Yash123443/Gujarati-Tourism-Sentiment-Analysis.git
cd Gujarati-Tourism-Sentiment-Analysis
git lfs pull
```

After cloning, confirm that `results/xlm_roberta_finetuned/model.safetensors` exists. If it does not, Git LFS was not downloaded correctly.

## Run locally

### 1. Start the backend

Create and activate a Python virtual environment, then install backend dependencies.

**Windows PowerShell**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r app\backend\requirements.txt
python -m uvicorn app.backend.main:app --host 127.0.0.1 --port 8000 --reload
```

**macOS / Linux**

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r app/backend/requirements.txt
python -m uvicorn app.backend.main:app --host 127.0.0.1 --port 8000 --reload
```

The first startup loads the 1.1 GB model and may take a minute on CPU. Keep this terminal open.

### 2. Start the frontend

Open a second terminal in the project folder:

```bash
cd app/frontend
npm install
npm run dev
```

Open the URL shown by Vite, normally [http://localhost:5173](http://localhost:5173).

## API

### `GET /api/health`

Returns the API and model-load status.

```json
{
  "status": "ok",
  "model_loaded": true
}
```

### `POST /api/predict`

Request:

```json
{
  "text": "ગીર જંગલ સફારી ખૂબ સરસ હતી, amazing experience!"
}
```

Response:

```json
{
  "label": "Positive",
  "confidence": 99.89,
  "scores": [
    { "label": "Positive", "score": 0.998901 },
    { "label": "Neutral", "score": 0.000652 },
    { "label": "Negative", "score": 0.000447 }
  ]
}
```

## Model results

| Model | Accuracy | Macro F1 |
|---|---:|---:|
| VADER | 56.01% | 55.09% |
| TF-IDF + Logistic Regression | 88.65% | 88.64% |
| TF-IDF + Linear SVM | 88.58% | 88.58% |
| XLM-R zero-shot | 88.18% | 88.26% |
| **Fine-tuned XLM-RoBERTa** | **96.06%** | **96.06%** |

The reported XLM-R score comes from 5-fold cross-validation. The deployed model was then trained on all 1,498 labeled reviews.

## Notes

- The application performs local inference; it does not retrain the model.
- The trained model is managed with Git LFS and is not duplicated by the backend.
- As with any NLP model, nuanced or highly ambiguous reviews can occasionally be misclassified.
