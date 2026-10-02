import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'

/* ------------------------------------------------------------------ */
/* Real metrics from results/metrics.json                               */
/* ------------------------------------------------------------------ */
const MODELS = [
  { name: 'VADER (Lexicon)',              acc: 56.01, f1: 55.09, cv: 'N/A',           en: 72.54, gu: 34.00, mx: 68.89 },
  { name: 'TF-IDF + Logistic Regression', acc: 88.65, f1: 88.64, cv: '88.6 ± 0.8%',  en: 85.94, gu: 89.83, mx: 89.78 },
  { name: 'TF-IDF + Linear SVM',          acc: 88.58, f1: 88.58, cv: '88.6 ± 1.4%',  en: 85.71, gu: 89.67, mx: 90.00 },
  { name: 'XLM-R (Zero-Shot)',             acc: 88.18, f1: 88.26, cv: 'N/A',           en: 93.08, gu: 84.17, mx: 88.67 },
  { name: '★ Fine-tuned XLM-RoBERTa',     acc: 96.06, f1: 96.06, cv: '96.1 ± 0.9%',  en: 95.31, gu: 96.17, mx: 96.67, champion: true },
]

/* ------------------------------------------------------------------ */
/* Animated count-up hook                                              */
/* ------------------------------------------------------------------ */
function useCountUp(target, duration = 1600) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const prog = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - prog, 3)
      ref.current.textContent = typeof target === 'number'
        ? (Number.isInteger(target) ? Math.round(ease * target) : (ease * target).toFixed(2))
        : target
      if (prog < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return ref
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                       */
/* ------------------------------------------------------------------ */
function AccBar({ pct, champion }) {
  const barRef = useRef(null)
  useEffect(() => {
    const el = barRef.current
    if (!el) return
    // Animate after mount
    const frame = requestAnimationFrame(() => {
      el.style.width = `${pct}%`
    })
    return () => cancelAnimationFrame(frame)
  }, [pct])

  return (
    <div className="acc-bar-wrap">
      <div className="acc-bar-track" style={{ flex: 1, minWidth: 80 }}>
        <div
          ref={barRef}
          className="acc-bar-fill"
          style={{ width: 0, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </div>
      <span className="acc-val" style={{ minWidth: 56, textAlign: 'right' }}>
        {pct.toFixed(2)}%
      </span>
    </div>
  )
}

function CountStat({ value, label, unit = '' }) {
  const numRef = useRef(null)
  useEffect(() => {
    if (!numRef.current) return
    let start = null
    const duration = 1800
    const step = (ts) => {
      if (!start) start = ts
      const prog = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - prog, 3)
      numRef.current.textContent = Math.round(ease * value) + unit
      if (prog < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value, unit])

  return (
    <div className="hero-stat">
      <div className="hero-stat-num" ref={numRef}>0{unit}</div>
      <div className="hero-stat-label">{label}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Main page                                                            */
/* ------------------------------------------------------------------ */
export default function OverviewPage() {
  return (
    <div className="page-wrapper">
      {/* Ambient background */}
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="grid-overlay" />

      {/* ============================================================ */}
      {/* HERO                                                          */}
      {/* ============================================================ */}
      <section className="hero">
        <div>
          <div className="hero-badge">
            🏆 Final Model Accuracy: 96.06%
          </div>

          <h1 className="hero-title">
            Gujarati Tourism{' '}
            <span className="gradient-text">Sentiment Analysis</span>
          </h1>

          <p className="hero-sub">
            An AI system that understands tourism reviews written in Gujarati, English,
            and code-mixed language — and classifies them as Positive, Neutral, or Negative
            with state-of-the-art accuracy.
          </p>

          <div className="hero-actions">
            <Link to="/analyzer" className="btn-primary">
              🚀 Try Live Analyzer
            </Link>
            <a href="#models" className="btn-secondary">
              📊 See Model Results
            </a>
          </div>

          <div className="hero-stats">
            <CountStat value={1498}  label="Tourism Reviews" />
            <div className="hero-divider" />
            <CountStat value={3}     label="Languages Supported" />
            <div className="hero-divider" />
            <CountStat value={96}    label="Peak Accuracy (%)" unit="%" />
            <div className="hero-divider" />
            <CountStat value={5}     label="Models Compared" />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* WHY THIS PROJECT?                                             */}
      {/* ============================================================ */}
      <section className="section" id="why">
        <div className="container">
          <span className="section-label">Motivation</span>
          <h2 className="section-heading">
            Why Gujarati Tourism Sentiment?
          </h2>
          <p className="section-sub">
            Gujarat is India's top emerging tourism destination — yet no NLP system existed
            that could handle the language mix its visitors actually write in.
          </p>

          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon">🗣️</div>
              <h3>Real Language, Real Reviews</h3>
              <p>
                Tourists write in Gujarati script, transliterated English-Gujarati, and
                code-mixed sentences. Standard NLP tools fail on all three simultaneously.
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">📍</div>
              <h3>Gujarat Tourism Boom</h3>
              <p>
                Statue of Unity, Rann of Kutch, Gir Forest, Somnath — millions of
                reviews are generated each year with no automated understanding of sentiment.
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">🧠</div>
              <h3>Multilingual AI Breakthrough</h3>
              <p>
                XLM-RoBERTa was fine-tuned on all 1,498 curated reviews, achieving 96.06%
                accuracy — a 40-point jump over naive lexicon methods.
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">💼</div>
              <h3>Business-Ready Insight</h3>
              <p>
                Hotel chains, tourism boards, and travel apps can integrate this system
                to surface genuine visitor sentiment at scale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PIPELINE                                                       */}
      {/* ============================================================ */}
      <section className="section section-alt" id="pipeline">
        <div className="container">
          <span className="section-label">How It Works</span>
          <h2 className="section-heading">The Prediction Pipeline</h2>
          <p className="section-sub">
            From raw review text to a confident sentiment label — three intelligent steps.
          </p>

          <div className="pipeline-steps">
            <div className="pipeline-step">
              <div className="pipeline-icon">✍️</div>
              <h4>Review Text</h4>
              <p>Gujarati, English, or mixed-language input from any tourism platform</p>
            </div>
            <span className="pipeline-arrow">→</span>
            <div className="pipeline-step">
              <div className="pipeline-icon">🔤</div>
              <h4>XLM-R Tokenizer</h4>
              <p>SentencePiece tokenizer handles all three language scripts natively</p>
            </div>
            <span className="pipeline-arrow">→</span>
            <div className="pipeline-step">
              <div className="pipeline-icon">🤖</div>
              <h4>Fine-tuned XLM-R</h4>
              <p>270M parameter transformer, fine-tuned on 1,498 curated tourism reviews</p>
            </div>
            <span className="pipeline-arrow">→</span>
            <div className="pipeline-step">
              <div className="pipeline-icon">📈</div>
              <h4>Sentiment Label</h4>
              <p>Positive · Neutral · Negative with confidence score per class</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* DATASET                                                        */}
      {/* ============================================================ */}
      <section className="section" id="dataset">
        <div className="container">
          <span className="section-label">Dataset</span>
          <h2 className="section-heading">1,498 Curated Tourism Reviews</h2>
          <p className="section-sub">
            Balanced across sentiments and languages, covering real visitor feedback
            for Gujarat's most popular tourist destinations.
          </p>

          <div className="dataset-grid">
            <div className="dataset-card">
              <h3>Sentiment Distribution</h3>
              {[
                { label: 'Positive', count: 504, dot: 'dot-pos' },
                { label: 'Neutral',  count: 497, dot: 'dot-neu' },
                { label: 'Negative', count: 497, dot: 'dot-neg' },
              ].map(r => (
                <div className="stat-row" key={r.label}>
                  <span className="stat-row-label">
                    <span className={`dot ${r.dot}`} />
                    {r.label}
                  </span>
                  <span className="stat-row-val">
                    {r.count} reviews ({(r.count / 1498 * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>

            <div className="dataset-card">
              <h3>Language Breakdown</h3>
              {[
                { label: 'Gujarati', count: 'Gujarati script reviews', dot: 'dot-gu' },
                { label: 'English',  count: 'Roman-script English',    dot: 'dot-en' },
                { label: 'Mixed',    count: 'Code-mixed reviews',       dot: 'dot-mx' },
              ].map(r => (
                <div className="stat-row" key={r.label}>
                  <span className="stat-row-label">
                    <span className={`dot ${r.dot}`} />
                    {r.label}
                  </span>
                  <span className="stat-row-val" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {r.count}
                  </span>
                </div>
              ))}

              <div style={{ marginTop: '1.5rem', padding: '0.9rem', borderRadius: 'var(--radius-sm)', background: 'var(--saffron-dim)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--saffron)', lineHeight: 1.6 }}>
                  <strong>Validation method:</strong> 5-fold cross-validation across all models.
                  The final XLM-R model was trained on all 1,498 reviews for deployment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MODEL COMPARISON                                               */}
      {/* ============================================================ */}
      <section className="section section-alt" id="models">
        <div className="container">
          <span className="section-label">Model Comparison</span>
          <h2 className="section-heading">5 Models. One Clear Winner.</h2>
          <p className="section-sub">
            Every approach — from rule-based lexicons to multilingual transformers — was
            rigorously evaluated using 5-fold cross-validation. The fine-tuned XLM-RoBERTa
            model dominates across all metrics and all language groups.
          </p>

          <div className="model-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Overall Accuracy</th>
                  <th>Macro F1</th>
                  <th>CV (5-fold)</th>
                  <th>Acc English</th>
                  <th>Acc Gujarati</th>
                  <th>Acc Mixed</th>
                </tr>
              </thead>
              <tbody>
                {MODELS.map(m => (
                  <tr key={m.name} className={m.champion ? 'champion-row' : ''}>
                    <td className="model-name-cell">
                      {m.name}
                      {m.champion && <span className="champion-badge">🏆 Deployed</span>}
                    </td>
                    <td>
                      <AccBar pct={m.acc} champion={m.champion} />
                    </td>
                    <td className="acc-val">{m.f1.toFixed(2)}%</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{m.cv}</td>
                    <td>{m.en.toFixed(2)}%</td>
                    <td>{m.gu.toFixed(2)}%</td>
                    <td>{m.mx.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key insight callout */}
          <div style={{
            marginTop: '1.75rem',
            padding: '1.25rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--teal-dim)',
            border: '1px solid var(--border-glow)',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>💡</span>
            <div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.65 }}>
                <strong style={{ color: 'var(--teal)' }}>Key insight:</strong> Fine-tuning XLM-RoBERTa
                on just 1,498 domain-specific examples delivered a <strong>+7.88%</strong> accuracy
                improvement over its own zero-shot baseline and a{' '}
                <strong>+40%</strong> improvement over VADER — demonstrating that transfer learning
                from multilingual pre-training, combined with targeted fine-tuning, is the definitive
                approach for low-resource Indic language NLP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* IMPACT                                                         */}
      {/* ============================================================ */}
      <section className="section" id="impact">
        <div className="container">
          <span className="section-label">Real-World Impact</span>
          <h2 className="section-heading">Who Benefits?</h2>
          <p className="section-sub">
            This system bridges the language gap between Gujarat's visitors and its tourism
            industry — enabling smarter decisions at every level.
          </p>

          <div className="impact-grid">
            <div className="impact-card">
              <div className="impact-icon">🏨</div>
              <h3>Tourism Businesses</h3>
              <p>
                Hotels, resorts, and tour operators can automatically monitor
                and respond to visitor sentiment across Gujarati and English review platforms
                without manual translation.
              </p>
            </div>
            <div className="impact-card">
              <div className="impact-icon">🗺️</div>
              <h3>Tourism Boards</h3>
              <p>
                Gujarat Tourism can analyze thousands of reviews to identify which
                destinations are thriving and which need improvement — in real time.
              </p>
            </div>
            <div className="impact-card">
              <div className="impact-icon">✈️</div>
              <h3>Travelers</h3>
              <p>
                Aggregated sentiment scores help future visitors make informed decisions
                about destinations, guided by authentic multilingual community feedback.
              </p>
            </div>
            <div className="impact-card">
              <div className="impact-icon">🔬</div>
              <h3>NLP Research</h3>
              <p>
                A replicable pipeline for low-resource Indic language sentiment analysis,
                extensible to other regional tourism contexts across India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA                                                            */}
      {/* ============================================================ */}
      <section className="cta-section">
        <div className="cta-glow" />
        <span className="section-label">Live Demo</span>
        <h2 className="section-heading" style={{ marginTop: '0.75rem' }}>
          Ready to analyze a review?
        </h2>
        <p>
          Enter any tourism review in Gujarati, English, or a mix of both.
          Our fine-tuned XLM-RoBERTa model will classify its sentiment in seconds.
        </p>
        <Link to="/analyzer" className="btn-primary" style={{ fontSize: '1.05rem', padding: '1rem 2.5rem' }}>
          🚀 Open Live Analyzer
        </Link>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>Gujarati Tourism Sentiment Analysis · Fine-tuned XLM-RoBERTa · 96.06% Accuracy</p>
        <p style={{ marginTop: '0.4rem' }}>Dataset: 1,498 reviews · Gujarati · English · Mixed</p>
      </footer>
    </div>
  )
}
