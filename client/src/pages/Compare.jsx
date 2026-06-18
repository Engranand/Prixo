import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const STORE_COLORS = {
  Amazon:   { color: '#FF9900', emoji: '🛒' },
  Flipkart: { color: '#2874F0', emoji: '📦' },
  Myntra:   { color: '#FF3F6C', emoji: '👗' },
}

const verdictColor = (v) => ({
  'Excellent Buy': '#c8f05a',
  'Good Buy': '#c8f05a',
  'Average Buy': '#ffb432',
  'Skip This': '#ff5a5a',
}[v] || '#c8f05a')

const ScoreRing = ({ score, size = 80 }) => {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#c8f05a' : score >= 60 ? '#ffb432' : '#ff5a5a'

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontSize: size > 70 ? '18px' : '14px', fontWeight: 800, color }}>{score}</span>
        <span style={{ fontSize: '9px', color: '#555250' }}>/100</span>
      </div>
    </div>
  )
}

const WinnerBadge = () => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    background: 'rgba(200,240,90,0.12)',
    border: '0.5px solid rgba(200,240,90,0.3)',
    borderRadius: '100px', padding: '4px 12px',
    fontSize: '11px', color: '#c8f05a', fontWeight: 700,
  }}>
    🏆 WINNER
  </div>
)

export default function Compare() {
  const navigate = useNavigate()
  const [url1, setUrl1] = useState('')
  const [url2, setUrl2] = useState('')
  const [product1, setProduct1] = useState(null)
  const [product2, setProduct2] = useState(null)
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const [compared, setCompared] = useState(false)

  const validateUrl = (url) =>
    url.includes('amazon') || url.includes('flipkart') || url.includes('myntra')

  const analyzeProduct = async (url, setLoading, setProduct, num) => {
    if (!url.trim()) return toast.error(`Please enter Product ${num} URL`)
    if (!validateUrl(url)) return toast.error('Only Amazon, Flipkart or Myntra URLs allowed')

    setLoading(true)
    try {
      const { data } = await axios.post('/api/product/analyze', { url })
      if (data.success) setProduct(data.data)
      else toast.error('Could not analyze product')
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to analyze Product ${num}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCompare = async () => {
    if (!url1.trim() || !url2.trim()) return toast.error('Please enter both product URLs')
    if (!validateUrl(url1) || !validateUrl(url2)) return toast.error('Only Amazon, Flipkart or Myntra URLs allowed')

    setProduct1(null)
    setProduct2(null)
    setCompared(false)

    await Promise.all([
      analyzeProduct(url1, setLoading1, setProduct1, 1),
      analyzeProduct(url2, setLoading2, setProduct2, 2),
    ])
    setCompared(true)
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleCompare() }

  const getLowest = (product) =>
    product?.prices?.reduce((a, b) => a.price < b.price ? a : b, product?.prices?.[0])

  const winner = product1 && product2
    ? (product1.aiScore >= product2.aiScore ? 1 : 2)
    : null

  const METRICS = [
    { label: 'AI Score', key: 'aiScore', format: v => `${v}/100`, higher: true },
    { label: 'Verdict', key: 'verdict', format: v => v, higher: null },
    { label: 'Best Price', key: null, format: null, higher: false, custom: true },
    { label: 'Value for Money', key: 'scoreBreakdown.valueForMoney', format: v => `${v}/100`, higher: true },
    { label: 'Quality', key: 'scoreBreakdown.quality', format: v => `${v}/100`, higher: true },
    { label: 'Durability', key: 'scoreBreakdown.durability', format: v => `${v}/100`, higher: true },
    { label: 'Popularity', key: 'scoreBreakdown.popularity', format: v => `${v}/100`, higher: true },
  ]

  const getVal = (product, key) => {
    if (!key) return null
    if (key.includes('.')) {
      const [obj, prop] = key.split('.')
      return product?.[obj]?.[prop]
    }
    return product?.[key]
  }

  const getWinnerForMetric = (key, higher) => {
    if (higher === null) return null
    const v1 = getVal(product1, key)
    const v2 = getVal(product2, key)
    if (!v1 || !v2) return null
    if (v1 === v2) return 0
    return higher ? (v1 > v2 ? 1 : 2) : (v1 < v2 ? 1 : 2)
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px 80px' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .shimmer { background:linear-gradient(90deg,#1a1a1a 25%,#252525 50%,#1a1a1a 75%); background-size:400px 100%; animation:shimmer 1.4s infinite; border-radius:10px; }
        .compare-section { animation: fadeUp 0.4s ease both; }
        .url-input:focus-within { border-color: rgba(200,240,90,0.4) !important; box-shadow: 0 0 0 3px rgba(200,240,90,0.06); }
        .btn-back:hover { color: #f0ede8 !important; border-color: rgba(255,255,255,0.25) !important; }
        .metric-row:hover { background: rgba(255,255,255,0.02) !important; }
        .store-link:hover { opacity: 0.8; transform: translateY(-1px); }

        @media (max-width: 768px) {
          .url-inputs-grid { grid-template-columns: 1fr !important; }
          .products-grid { grid-template-columns: 1fr !important; }
          .metrics-table { font-size: 12px !important; }
          .compare-pad { padding: 40px 16px 60px !important; }
        }
      `}</style>

      {/* Back */}
      <button className="btn-back" onClick={() => navigate('/')} style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)',
        borderRadius: '100px', color: '#888580', fontSize: '13px',
        padding: '7px 16px', cursor: 'pointer',
        fontFamily: 'DM Sans, sans-serif', marginBottom: '32px', transition: 'all 0.2s',
      }}>
        ← Back
      </button>

      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(200,240,90,0.06)', border: '0.5px solid rgba(200,240,90,0.2)',
          borderRadius: '100px', padding: '5px 14px',
          fontSize: '12px', color: '#c8f05a', marginBottom: '16px',
        }}>
          ⚖️ Side by Side Comparison
        </div>
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '10px',
        }}>
          Compare <span style={{ color: '#c8f05a' }}>any two</span> products
        </h1>
        <p style={{ color: '#888580', fontSize: '15px', fontWeight: 300 }}>
          Paste URLs from Amazon, Flipkart or Myntra — AI will compare prices, scores & features
        </p>
      </div>

      {/* URL Inputs */}
      <div className="url-inputs-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
        {[
          { val: url1, set: setUrl1, label: 'Product 1', placeholder: 'Paste Amazon/Flipkart/Myntra URL…', loading: loading1 },
          { val: url2, set: setUrl2, label: 'Product 2', placeholder: 'Paste Amazon/Flipkart/Myntra URL…', loading: loading2 },
        ].map((item, i) => (
          <div key={i}>
            <div style={{ fontSize: '11px', color: '#888580', marginBottom: '8px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {item.label}
            </div>
            <div className="url-input" style={{
              background: '#161616', border: '0.5px solid rgba(255,255,255,0.12)',
              borderRadius: '14px', padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: '10px',
              transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: '16px' }}>{i === 0 ? '🅰️' : '🅱️'}</span>
              <input
                value={item.val}
                onChange={e => item.set(e.target.value)}
                onKeyDown={handleKey}
                placeholder={item.placeholder}
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  outline: 'none', color: '#f0ede8',
                  fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
                  minWidth: 0,
                }}
              />
              {item.loading && (
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c8f05a', animation: 'pulse 1s infinite', flexShrink: 0 }} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* VS divider + Compare button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
        <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{
          fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 800,
          color: '#555250', letterSpacing: '2px',
        }}>VS</div>
        <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.07)' }} />
        <button onClick={handleCompare} disabled={loading1 || loading2} style={{
          padding: '11px 28px', border: 'none', borderRadius: '100px',
          background: '#c8f05a', color: '#080808',
          fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'Syne, sans-serif', transition: 'all 0.2s',
          opacity: loading1 || loading2 ? 0.6 : 1,
          whiteSpace: 'nowrap',
        }}>
          {loading1 || loading2 ? '⏳ Analyzing…' : '⚖️ Compare Now'}
        </button>
      </div>

      {/* Loading skeletons */}
      {(loading1 || loading2) && (
        <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          {[1, 2].map(i => (
            <div key={i} style={{ background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px' }}>
              <div className="shimmer" style={{ height: '100px', marginBottom: '16px' }} />
              <div className="shimmer" style={{ height: '18px', width: '70%', marginBottom: '10px' }} />
              <div className="shimmer" style={{ height: '14px', width: '45%', marginBottom: '16px' }} />
              <div className="shimmer" style={{ height: '60px' }} />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {compared && product1 && product2 && (
        <>
          {/* Winner Banner */}
          <div className="compare-section" style={{
            background: 'rgba(200,240,90,0.06)',
            border: '0.5px solid rgba(200,240,90,0.2)',
            borderRadius: '16px', padding: '16px 24px',
            marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '14px',
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: '24px' }}>🏆</span>
            <div>
              <div style={{ fontSize: '11px', color: '#888580', marginBottom: '3px' }}>AI Recommendation</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#c8f05a' }}>
                {winner === 1 ? product1.title : product2.title}
                <span style={{ color: '#888580', fontWeight: 400, fontSize: '13px' }}> is the better buy</span>
              </div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#888580' }}>Score difference</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800, color: '#c8f05a' }}>
                +{Math.abs(product1.aiScore - product2.aiScore)} pts
              </div>
            </div>
          </div>

          {/* Product Cards Side by Side */}
          <div className="products-grid compare-section" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '14px', marginBottom: '14px', animationDelay: '0.05s',
          }}>
            {[product1, product2].map((product, idx) => {
              const lowest = getLowest(product)
              const isWinner = winner === idx + 1
              return (
                <div key={idx} style={{
                  background: '#161616',
                  border: `0.5px solid ${isWinner ? 'rgba(200,240,90,0.25)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: '20px', padding: '22px',
                  position: 'relative',
                }}>
                  {isWinner && (
                    <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)' }}>
                      <WinnerBadge />
                    </div>
                  )}

                  {/* Image + Title */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{
                      width: '70px', height: '70px', flexShrink: 0,
                      background: '#1e1e1e', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                    }}>
                      {product.image
                        ? <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
                        : <span style={{ fontSize: '28px' }}>📦</span>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 700, lineHeight: 1.35, marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.title}
                      </div>
                      <div style={{
                        display: 'inline-flex', fontSize: '11px', fontWeight: 600,
                        color: verdictColor(product.verdict),
                        background: `${verdictColor(product.verdict)}15`,
                        border: `0.5px solid ${verdictColor(product.verdict)}35`,
                        borderRadius: '100px', padding: '2px 10px',
                      }}>
                        {product.verdict}
                      </div>
                    </div>
                  </div>

                  {/* Score Ring */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <ScoreRing score={product.aiScore} size={90} />
                  </div>

                  {/* Best Price */}
                  {lowest && (
                    <div style={{
                      background: isWinner ? 'rgba(200,240,90,0.06)' : '#1a1a1a',
                      border: `0.5px solid ${isWinner ? 'rgba(200,240,90,0.2)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: '12px', padding: '12px 14px', marginBottom: '14px',
                    }}>
                      <div style={{ fontSize: '11px', color: '#888580', marginBottom: '4px' }}>Best Price</div>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, color: isWinner ? '#c8f05a' : '#f0ede8' }}>
                        ₹{lowest.price?.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '11px', color: '#888580' }}>on {lowest.store}</div>
                    </div>
                  )}

                  {/* Store Prices */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {product.prices?.map((p, pi) => {
                      const sc = STORE_COLORS[p.store] || { color: '#888', emoji: '🛒' }
                      return (
                        <a key={pi} href={p.url} target="_blank" rel="noopener noreferrer" className="store-link"
                          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: '8px', background: p.isLowest ? `${sc.color}10` : 'transparent', border: `0.5px solid ${p.isLowest ? `${sc.color}30` : 'transparent'}`, transition: 'all 0.15s' }}
                        >
                          <span style={{ fontSize: '12px', color: sc.color, fontWeight: 500 }}>{sc.emoji} {p.store}</span>
                          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 700, color: p.isLowest ? sc.color : '#888580' }}>
                            ₹{p.price?.toLocaleString()} {p.isLowest && '★'}
                          </span>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Detailed Metrics Table */}
          <div className="compare-section" style={{
            background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)',
            borderRadius: '20px', padding: '24px', marginBottom: '14px',
            animationDelay: '0.1s',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#c8f05a', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px' }}>
              Detailed Comparison
            </div>

            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px', paddingBottom: '10px', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '11px', color: '#555250' }}>Metric</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#f0ede8', textAlign: 'center', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                🅰️ {product1.title?.split(' ').slice(0, 3).join(' ')}…
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#f0ede8', textAlign: 'center', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                🅱️ {product2.title?.split(' ').slice(0, 3).join(' ')}…
              </div>
            </div>

            {METRICS.map((metric, mi) => {
              const v1 = metric.custom ? getLowest(product1)?.price : getVal(product1, metric.key)
              const v2 = metric.custom ? getLowest(product2)?.price : getVal(product2, metric.key)
              const metricWinner = metric.custom
                ? (v1 < v2 ? 1 : v2 < v1 ? 2 : 0)
                : getWinnerForMetric(metric.key, metric.higher)

              const format1 = metric.custom ? `₹${v1?.toLocaleString()}` : (metric.format ? metric.format(v1) : v1)
              const format2 = metric.custom ? `₹${v2?.toLocaleString()}` : (metric.format ? metric.format(v2) : v2)

              return (
                <div key={mi} className="metric-row" style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '10px', padding: '10px 6px', borderRadius: '8px',
                  borderBottom: mi < METRICS.length - 1 ? '0.5px solid rgba(255,255,255,0.04)' : 'none',
                  transition: 'background 0.15s',
                }}>
                  <div style={{ fontSize: '12px', color: '#888580', display: 'flex', alignItems: 'center' }}>
                    {metric.label}
                  </div>
                  <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '13px', fontWeight: metricWinner === 1 ? 700 : 400,
                      color: metricWinner === 1 ? '#c8f05a' : '#888580',
                      fontFamily: typeof v1 === 'number' ? 'Syne, sans-serif' : 'DM Sans, sans-serif',
                    }}>
                      {format1 || '—'}
                    </span>
                    {metricWinner === 1 && <span style={{ fontSize: '10px' }}>✅</span>}
                  </div>
                  <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '13px', fontWeight: metricWinner === 2 ? 700 : 400,
                      color: metricWinner === 2 ? '#c8f05a' : '#888580',
                      fontFamily: typeof v2 === 'number' ? 'Syne, sans-serif' : 'DM Sans, sans-serif',
                    }}>
                      {format2 || '—'}
                    </span>
                    {metricWinner === 2 && <span style={{ fontSize: '10px' }}>✅</span>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pros Cons Side by Side */}
          <div className="products-grid compare-section" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '14px', animationDelay: '0.15s',
          }}>
            {[product1, product2].map((product, idx) => (
              <div key={idx} style={{
                background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)',
                borderRadius: '20px', padding: '20px',
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#f0ede8', fontFamily: 'Syne, sans-serif', marginBottom: '14px' }}>
                  {idx === 0 ? '🅰️' : '🅱️'} {product.title?.split(' ').slice(0, 4).join(' ')}…
                </div>

                {/* Pros */}
                <div style={{ fontSize: '10px', color: '#c8f05a', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Strengths</div>
                {product.pros?.slice(0, 3).map((pro, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#c8f05a', fontSize: '11px', marginTop: '1px' }}>✓</span>
                    <span style={{ fontSize: '12px', color: '#888580', lineHeight: 1.4 }}>{pro}</span>
                  </div>
                ))}

                {/* Cons */}
                <div style={{ fontSize: '10px', color: '#ff5a5a', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', margin: '12px 0 8px' }}>Limitations</div>
                {product.cons?.slice(0, 2).map((con, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#ff5a5a', fontSize: '11px', marginTop: '1px' }}>✗</span>
                    <span style={{ fontSize: '12px', color: '#888580', lineHeight: 1.4 }}>{con}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Final Verdict */}
          <div className="compare-section" style={{
            background: 'linear-gradient(135deg, #161616 0%, #1a1f0f 100%)',
            border: '0.5px solid rgba(200,240,90,0.2)',
            borderRadius: '20px', padding: '28px 24px',
            marginTop: '14px', textAlign: 'center',
            animationDelay: '0.2s',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🏆</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800, color: '#c8f05a', marginBottom: '8px' }}>
              {winner === 1 ? product1.title?.split(' ').slice(0, 5).join(' ') : product2.title?.split(' ').slice(0, 5).join(' ')}…
            </div>
            <div style={{ fontSize: '14px', color: '#888580', marginBottom: '20px' }}>
              wins with a score of <strong style={{ color: '#f0ede8' }}>{winner === 1 ? product1.aiScore : product2.aiScore}/100</strong> vs <strong style={{ color: '#888580' }}>{winner === 1 ? product2.aiScore : product1.aiScore}/100</strong>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={getLowest(winner === 1 ? product1 : product2)?.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '11px 24px', border: 'none', borderRadius: '100px',
                  background: '#c8f05a', color: '#080808',
                  fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'Syne, sans-serif',
                }}>
                  Buy Winner →
                </button>
              </a>
              <button onClick={() => { setProduct1(null); setProduct2(null); setUrl1(''); setUrl2(''); setCompared(false) }} style={{
                padding: '11px 24px', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '100px',
                background: 'transparent', color: '#888580',
                fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
              }}>
                Compare Again
              </button>
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {!compared && !loading1 && !loading2 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#555250' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚖️</div>
          <div style={{ fontSize: '15px' }}>Paste two product URLs above and hit <strong style={{ color: '#c8f05a' }}>Compare Now</strong></div>
          <div style={{ fontSize: '13px', marginTop: '8px' }}>Works with Amazon, Flipkart & Myntra</div>
        </div>
      )}
    </div>
  )
}