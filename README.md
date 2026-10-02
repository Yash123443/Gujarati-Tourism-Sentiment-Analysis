# Gujarati Tourism Sentiment Analysis — Local Web Demo

A production-quality, full-stack AI web application for analyzing sentiment in Gujarati, English, and mixed-language tourism reviews using a **fine-tuned XLM-RoBERTa** model.

## 📁 Project Structure

```
NPL main/
├── app/
│   ├── backend/
│   │   ├── main.py            ← FastAPI backend
│   │   └── requirements.txt   ← Backend Python deps
│   └── frontend/
│       ├── src/
│       │   ├── pages/
│       │   │   ├── OverviewPage.jsx   ← Landing/project overview
│       │   │   └── AnalyzerPage.jsx   ← Live sentiment analyzer
│       │   ├── components/
│       │   │   └── Navbar.jsx
│       │   ├── App.jsx
│       │   ├── main.jsx
│       │   └── index.css
│       ├── index.html
│       ├── package.json
│       └── vite.config.js
├── results/
│   └── xlm_roberta_finetuned/   ← Model files (untouched, ~1.1 GB)
│       ├── model.safetensors
│       ├── config.json
│       ├── tokenizer.json
│       └── tokenizer_config.json
└── Gujarati_Tourism_Sentiment_Analysis.ipynb
```

---

## ⚡ Quick Start (Windows)

### Prerequisites

| Tool | Minimum Version | Check |
|------|----------------|-------|
| Python | 3.10+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |

> **Important:** PyTorch must already be installed in your Python environment.
> If not, install it first from https://pytorch.org (CPU version is fine for inference).

---

### Step 1 — Set up Python environment

Open **PowerShell** or **Command Prompt** inside the `NPL main` folder:

```powershell
# Activate your existing venv (or create one)
.\venv\Scripts\activate

# Install backend dependencies
pip install -r app\backend\requirements.txt
```

---

### Step 2 — Start the Backend

With your venv still active, from inside `NPL main`:

```powershell
uvicorn app.backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Wait for the log message:
```
INFO: Model ready. Labels: {0: 'Positive', 1: 'Neutral', 2: 'Negative'}
INFO: Application startup complete.
```

> **Note:** The model is 1.1 GB — the first load takes 20–60 seconds on CPU. Subsequent requests are fast.

Test the backend is live:
```powershell
curl http://localhost:8000/api/health
```
Expected response: `{"status":"ok","model_loaded":true,...}`

---

### Step 3 — Start the Frontend

Open a **second** PowerShell / Command Prompt window, navigate to the frontend folder:

```powershell
cd "C:\Users\Yash\OneDrive\Desktop\NPL main\app\frontend"
npm run dev
```

The frontend will start at **http://localhost:5173**

---

### Step 4 — Open in Browser

Navigate to **http://localhost:5173**

- **Page 1 — Overview**: Project landing page with model comparison table, pipeline, dataset info
- **Page 2 — Live Analyzer**: Enter any Gujarati/English/mixed review and get real-time sentiment prediction

---

## 🔌 API Reference

### `GET /api/health`
Returns model load status.

```json
{
  "status": "ok",
  "model_loaded": true,
  "model_dir": "C:\\...\\results\\xlm_roberta_finetuned"
}
```

### `POST /api/predict`
Request body:
```json
{ "text": "Statue of Unity khub sunder che!" }
```

Response:
```json
{
  "label": "Positive",
  "confidence": 98.72,
  "scores": [
    { "label": "Positive", "score": 0.987234 },
    { "label": "Neutral",  "score": 0.008901 },
    { "label": "Negative", "score": 0.003865 }
  ]
}
```

---

## 🤖 Model Details

| Property | Value |
|----------|-------|
| Base model | `xlm-roberta-base` |
| Architecture | `XLMRobertaForSequenceClassification` |
| Parameters | ~270M |
| Labels | Positive (0), Neutral (1), Negative (2) |
| Overall Accuracy | **96.06%** (5-fold cross-validation) |
| Training data | 1,498 Gujarati tourism reviews |
| Languages | Gujarati · English · Code-mixed |

---

## 📊 Model Comparison

| Model | Accuracy | Macro F1 |
|-------|----------|----------|
| VADER (lexicon) | 56.01% | 55.09% |
| TF-IDF + Logistic Regression | 88.65% | 88.64% |
| TF-IDF + Linear SVM | 88.58% | 88.58% |
| XLM-R (zero-shot) | 88.18% | 88.26% |
| **Fine-tuned XLM-RoBERTa** | **96.06%** | **96.06%** |

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| `uvicorn` not found | Run `pip install uvicorn` with venv active |
| Model load fails | Verify `results/xlm_roberta_finetuned/model.safetensors` exists (1.04 GB) |
| Frontend can't reach backend | Ensure backend is running on port 8000 before loading frontend |
| Slow first prediction | Normal — CPU inference for a 270M parameter model takes 5–15 seconds |
| `torch` not found | Install PyTorch from https://pytorch.org before running pip install |

---

## 🚫 What This Demo Does NOT Do

- It does **not** retrain the model
- It does **not** move or duplicate the model files
- It does **not** use the old joblib/TF-IDF model
- All predictions are live from the FastAPI backend

---

*Built with FastAPI · React · Vite · Transformers · XLM-RoBERTa*
