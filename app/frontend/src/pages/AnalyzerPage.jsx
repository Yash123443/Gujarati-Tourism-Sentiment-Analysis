import { useState, useRef } from 'react'

/* ------------------------------------------------------------------ */
/* Sample reviews in all three languages                                */
/* ------------------------------------------------------------------ */
const SAMPLES = [
  {
    lang: 'GU',
    label: 'Gujarati',
    text: 'સ્ટેચ્યુ ઓફ યુનિટી ખૂબ જ સુંદર અને ભવ્ય છે. ત્યાંની સ્વચ્છતા અને વ્યવસ્થા ઉત્કૃષ્ટ હતી. ચોક્કસ ફરી જઈશ.',
  },
  {
    lang: 'EN',
    label: 'English',
    text: 'The Rann of Kutch festival was an absolutely stunning experience. The white salt desert under moonlight is breathtaking. Highly recommended!',
  },
  {
    lang: 'MIX',
    label: 'Mixed',
    text: 'Gir forest safari khub sari hati, lions joya ane guides pan helpful hata. Overall experience was amazing!',
  },
  {
    lang: 'GU',
    label: 'Gujarati (Neutral)',
    text: 'સોમનાથ મંદિર ઐતિહાસિક રીતે મહત્ત્વનું છે. ભીડ ઘણી હતી. ટિકિટ ખૂબ સસ્તી છે.',
  },
  {
    lang: 'EN',
    label: 'English (Negative)',
    text: 'Very disappointing visit to Dwarka. The beach was dirty, facilities were poor and the staff was rude. Not worth the long journey.',
  },
  {
    lang: 'MIX',
    label: 'Mixed (Negative)',
    text: 'Ahmedabad hotel service khub kharab hati. Room clean na hato ane food bhi tasty na hato. Will not visit again.',
  },
]

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */
function getSentimentMeta(label) {
  switch (label) {
    case 'Positive': return { emoji: '😊', colorClass: 'sentiment-pos', badgeClass: 'sentiment-badge-pos' }
    case 'Neutral':  return { emoji: '😐', colorClass: 'sentiment-neu', badgeClass: 'sentiment-badge-neu' }
    case 'Negative': return { emoji: '😞', colorClass: 'sentiment-neg', badgeClass: 'sentiment-badge-neg' }
    default:         return { emoji: '🤔', colorClass: '', badgeClass: '' }
  }
}

function getProbFillClass(label) {
  switch (label) {
    case 'Positive': return 'prob-fill-pos'
    case 'Neutral':  return 'prob-fill-neu'
    case 'Negative': return 'prob-fill-neg'
    default: return ''
  }
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                       */
/* ------------------------------------------------------------------ */
function LoadingState() {
  return (
    <div className="loading-state">
      <div className="spinner-ring" />
      <p>Analyzing review with XLM-RoBERTa…</p>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        First inference may take a few seconds while the model warms up.
      </p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-icon">🔍</div>
      <p><strong style={{ color: 'var(--text-secondary)' }}>No prediction yet</strong></p>
      <p>Enter a review and click <em>Analyze Sentiment</em></p>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div className="error-state">
      <span className="error-icon">⚠️</span>
      <h4>Could not get prediction</h4>
      <p>{message}</p>
    </div>
  )
}

function ResultCard({ result }) {
  const meta = getSentimentMeta(result.label)

  return (
    <div className="result-card">
      {/* Sentiment badge */}
      <div className={`sentiment-badge ${meta.badgeClass}`}>
        <span className="sentiment-emoji">{meta.emoji}</span>
        <div className="sentiment-info">
          <h2 className={meta.colorClass}>{result.label}</h2>
          <p className="confidence-pct">
            Confidence: <strong>{result.confidence.toFixed(1)}%</strong>
          </p>
        </div>
      </div>

      {/* Per-class probability bars */}
      <h3>Probability Breakdown</h3>
      <div className="prob-bars">
        {result.scores.map(s => (
          <div className="prob-row" key={s.label}>
            <div className="prob-row-header">
              <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
              <span className="prob-pct" style={{
                color: s.label === 'Positive' ? 'var(--positive)'
                     : s.label === 'Neutral'  ? 'var(--neutral)'
                     : 'var(--negative)',
              }}>
                {(s.score * 100).toFixed(1)}%
              </span>
            </div>
            <div className="prob-track">
              <div
                className={`prob-fill ${getProbFillClass(s.label)}`}
                style={{ width: `${s.score * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Meta info */}
      <div style={{
        marginTop: '1.5rem',
        padding: '0.85rem',
        background: 'rgba(255,255,255,0.025)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        lineHeight: 1.6,
      }}>
        🤖 Prediction by <strong style={{ color: 'var(--teal)' }}>Fine-tuned XLM-RoBERTa</strong> ·
        &nbsp;Supports Gujarati · English · Mixed
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Main Analyzer page                                                   */
/* ------------------------------------------------------------------ */
export default function AnalyzerPage() {
  const [text, setText] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const textareaRef = useRef(null)

  const handleAnalyze = async () => {
    const trimmed = text.trim()
    if (!trimmed) {
      setErrorMsg('Please enter a review before analyzing.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setResult(null)
    setErrorMsg('')

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      })

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        throw new Error(detail?.detail || `Server error: ${res.status}`)
      }

      const data = await res.json()
      setResult(data)
      setStatus('success')
    } catch (err) {
      setErrorMsg(
        err.message.includes('Failed to fetch')
          ? 'Cannot reach the backend. Make sure uvicorn is running on port 8000.'
          : err.message
      )
      setStatus('error')
    }
  }

  const handleClear = () => {
    setText('')
    setStatus('idle')
    setResult(null)
    setErrorMsg('')
    textareaRef.current?.focus()
  }

  const handleSample = (sample) => {
    setText(sample.text)
    setStatus('idle')
    setResult(null)
    setErrorMsg('')
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleAnalyze()
    }
  }

  return (
    <div className="page-wrapper">
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="grid-overlay" />

      <div className="analyzer-page">
        {/* Header */}
        <div className="analyzer-header">
          <span className="section-label">Live Demo</span>
          <h1 className="section-heading" style={{ textAlign: 'center', marginTop: '0.75rem' }}>
            Sentiment{' '}
            <span className="gradient-text">Analyzer</span>
          </h1>
          <p className="section-sub" style={{ textAlign: 'center', marginInline: 'auto' }}>
            Enter a tourism review in <strong>Gujarati</strong>, <strong>English</strong>, or{' '}
            <strong>mixed language</strong>. The fine-tuned XLM-RoBERTa model will classify
            its sentiment instantly.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="analyzer-layout">
          {/* ---- Input panel ---- */}
          <div className="input-panel">
            <h3>📝 Your Review</h3>

            {/* Sample chips */}
            <div className="sample-chips">
              {SAMPLES.map((s, i) => (
                <button
                  key={i}
                  className="chip"
                  onClick={() => handleSample(s)}
                  title={s.text}
                >
                  <span className="chip-lang">{s.lang}</span>
                  {s.label}
                </button>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              id="review-input"
              className="review-textarea"
              placeholder={
                'Type or paste a tourism review here…\n\nExamples:\n• "સ્ટેચ્યુ ઓફ યુનિટી ખૂબ સુંદર છે" (Gujarati)\n• "Rann Utsav was breathtaking!" (English)\n• "Gir safari khub sari hati!" (Mixed)'
              }
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={9}
              maxLength={2048}
            />

            <div className="char-count">
              {text.length} / 2048 characters · Ctrl+Enter to analyze
            </div>

            <div className="input-actions">
              <button
                id="analyze-btn"
                className="btn-analyze"
                onClick={handleAnalyze}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <>
                    <div style={{
                      width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)',
                      borderTopColor: '#000', borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite', flexShrink: 0,
                    }} />
                    Analyzing…
                  </>
                ) : '🔍 Analyze Sentiment'}
              </button>
              <button id="clear-btn" className="btn-clear" onClick={handleClear}>
                ✕ Clear
              </button>
            </div>
          </div>

          {/* ---- Result panel ---- */}
          <div className="result-panel">
            <h3>📊 Prediction Result</h3>

            {status === 'idle' && <EmptyState />}
            {status === 'loading' && <LoadingState />}
            {status === 'error' && <ErrorState message={errorMsg} />}
            {status === 'success' && result && <ResultCard result={result} />}
          </div>
        </div>

        {/* Info bar */}
        <div style={{
          marginTop: '2rem',
          maxWidth: 1060,
          width: '100%',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
        }}>
          <span>🤖 <strong style={{ color: 'var(--text-secondary)' }}>Model:</strong> Fine-tuned XLM-RoBERTa-base</span>
          <span>🎯 <strong style={{ color: 'var(--text-secondary)' }}>Accuracy:</strong> 96.06% (5-fold CV)</span>
          <span>🌐 <strong style={{ color: 'var(--text-secondary)' }}>Languages:</strong> Gujarati · English · Mixed</span>
          <span>⚡ <strong style={{ color: 'var(--text-secondary)' }}>Inference:</strong> Local CPU via FastAPI</span>
        </div>
      </div>
    </div>
  )
}
