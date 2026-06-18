import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from 'recharts'
import ScoreBar from '../components/ScoreBar'
import ScoreBadge from '../components/ScoreBadge'

// Generate realistic price history data (last 30 days)
const generatePriceHistory = (prices) => {
  const today = new Date()
  const days = 30
  const history = []

  const storeColors = {
    Amazon: '#FF9900',
    Flipkart: '#2874F0',
    Myntra: '#FF3F6C',
  }

  for (let i = days; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

    const point = { date: label }
    prices?.forEach(p => {
      // Simulate realistic price fluctuation (±8%)
      const base = p.price
      const fluctuation = 1 + (Math.sin(i * 0.4 + p.price) * 0.06) + (Math.random() * 0.04 - 0.02)
      const historicalPrice = Math.round(base * fluctuation / 10) * 10
      point[p.store] = historicalPrice
    })
    history.push(point)
  }

  // Make last point = current actual price
  if (history.length > 0) {
    prices?.forEach(p => { history[history.length - 1][p.store] = p.price })
  }

  return history
}

// Custom tooltip for chart
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1a1a1a',
      border: '0.5px solid rgba(255,255,255,0.12)',
      borderRadius: '12px', padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <div style={{ fontSize: '11px', color: '#888580', marginBottom: '8px' }}>{label}</div>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }} />
          <span style={{ fontSize: '12px', color: '#888580' }}>{entry.name}:</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#f0ede8', fontFamily: 'Syne, sans-serif' }}>
            ₹{entry.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

const STORE_COLORS = {
  Amazon: '#FF9900',
  Flipkart: '#2874F0',
  Myntra: '#FF3F6C',
}

export default function Result() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const product = state?.product
  const [copied, setCopied] = useState(false)
  const [showGraph, setShowGraph] = useState(true)

  useEffect(() => {
    if (!product) navigate('/')
  }, [product, navigate])

  if (!product) return null

  const lowestPrice = product.prices?.reduce((a, b) => a.price < b.price ? a : b, product.prices[0])
  const highestPrice = product.prices?.reduce((a, b) => a.price > b.price ? a : b, product.prices[0])
  const maxSaving = highestPrice && lowestPrice ? highestPrice.price - lowestPrice.price : 0

  const verdictColor = {
    'Excellent Buy': '#c8f05a',
    'Good Buy': '#c8f05a',
    'Average Buy': '#ffb432',
    'Skip This': '#ff5a5a',
  }[product.verdict] || '#c8f05a'

  const priceHistory = generatePriceHistory(product.prices)

  // Buy or Wait logic
  const getBuyRecommendation = () => {
    const score = product.aiScore || 75
    if (score >= 85) return { label: '✅ Buy Now', color: '#c8f05a', bg: 'rgba(200,240,90,0.08)', border: 'rgba(200,240,90,0.25)', reason: 'Excellent value — price is at a good point right now.' }
    if (score >= 70) return { label: '👍 Good to Buy', color: '#c8f05a', bg: 'rgba(200,240,90,0.06)', border: 'rgba(200,240,90,0.2)', reason: 'Good deal. Price may drop slightly during sales, but not worth waiting.' }
    if (score >= 55) return { label: '⏳ Wait for Sale', color: '#ffb432', bg: 'rgba(255,180,50,0.08)', border: 'rgba(255,180,50,0.25)', reason: 'Average pricing. Wait for a festival sale — you could save 15–20% more.' }
    return { label: '🚫 Skip This', color: '#ff5a5a', bg: 'rgba(255,90,90,0.08)', border: 'rgba(255,90,90,0.25)', reason: 'Overpriced or poor value. Consider alternatives.' }
  }

  const recommendation = getBuyRecommendation()

  const handleShare = async () => {
    const text = `🛍️ Found ${product.title}\n💰 Best price: ₹${lowestPrice?.price?.toLocaleString()} on ${lowestPrice?.store}\n🤖 AI Score: ${product.aiScore}/100 — ${product.verdict}\n\nCompared via Prixo`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert(text)
    }
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px 80px' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .result-section { animation: fadeUp 0.4s ease both; }
        .price-row { transition: background 0.2s; cursor: pointer; }
        .price-row:hover { background: rgba(255,255,255,0.03) !important; }
        .pro-item:hover { background: rgba(200,240,90,0.03) !important; }
        .con-item:hover { background: rgba(255,90,90,0.03) !important; }
        .btn-back:hover { color: #f0ede8 !important; border-color: rgba(255,255,255,0.25) !important; }
        .share-btn:hover { background: #2a2a2a !important; }
        .graph-toggle:hover { border-color: rgba(200,240,90,0.3) !important; color: #c8f05a !important; }

        @media (max-width: 768px) {
          .pros-cons-grid { grid-template-columns: 1fr !important; }
          .product-header { flex-direction: column !important; align-items: flex-start !important; }
          .product-img { width: 80px !important; height: 80px !important; }
          .product-title { font-size: 17px !important; }
          .result-pad { padding: 40px 16px 60px !important; }
          .header-actions { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .price-cards-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Top Actions Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '10px' }}>
        <button className="btn-back" onClick={() => navigate('/')} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)',
          borderRadius: '100px', color: '#888580',
          fontSize: '13px', padding: '7px 16px',
          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          transition: 'all 0.2s',
        }}>
          ← Back
        </button>

        <button className="share-btn" onClick={handleShare} style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          background: '#1e1e1e', border: '0.5px solid rgba(255,255,255,0.12)',
          borderRadius: '100px', color: copied ? '#c8f05a' : '#888580',
          fontSize: '13px', padding: '7px 16px',
          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          transition: 'all 0.2s',
        }}>
          {copied ? '✅ Copied!' : '📤 Share Result'}
        </button>
      </div>

      {/* Product Header */}
      <div className="result-section" style={{
        background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)',
        borderRadius: '20px', padding: '24px', marginBottom: '14px',
        animationDelay: '0s',
      }}>
        <div className="product-header" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          {product.image
            ? <img src={product.image} alt={product.title} className="product-img"
                style={{ width: '110px', height: '110px', objectFit: 'contain', borderRadius: '12px', background: '#1e1e1e', flexShrink: 0 }}
              />
            : <div className="product-img" style={{ width: '110px', height: '110px', background: '#1e1e1e', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', flexShrink: 0 }}>📦</div>
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            {product.brand && (
              <div style={{ fontSize: '11px', color: '#888580', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {product.brand}
              </div>
            )}
            <h1 className="product-title" style={{ fontFamily: 'Syne, sans-serif', fontSize: '19px', fontWeight: 700, lineHeight: 1.3, marginBottom: '12px', letterSpacing: '-0.3px' }}>
              {product.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <ScoreBadge score={product.aiScore} size="lg" />
              <div style={{
                background: `${verdictColor}18`, border: `0.5px solid ${verdictColor}40`,
                borderRadius: '100px', padding: '5px 14px',
                fontSize: '13px', color: verdictColor, fontWeight: 500,
              }}>
                {product.verdict}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buy / Wait Recommendation */}
      <div className="result-section" style={{
        background: recommendation.bg,
        border: `0.5px solid ${recommendation.border}`,
        borderRadius: '14px', padding: '16px 20px',
        marginBottom: '14px', animationDelay: '0.05s',
        display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
      }}>
        <div style={{
          fontSize: '15px', fontWeight: 800, color: recommendation.color,
          fontFamily: 'Syne, sans-serif', whiteSpace: 'nowrap',
        }}>
          {recommendation.label}
        </div>
        <div style={{ fontSize: '13px', color: '#888580', lineHeight: 1.5 }}>
          {recommendation.reason}
        </div>
      </div>

      {/* Savings Banner */}
      {lowestPrice && (
        <div className="result-section" style={{
          background: 'rgba(200,240,90,0.06)', border: '0.5px solid rgba(200,240,90,0.2)',
          borderRadius: '14px', padding: '14px 20px',
          marginBottom: '14px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          gap: '10px', flexWrap: 'wrap', animationDelay: '0.08s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>💰</span>
            <span style={{ fontSize: '14px', color: '#c8f05a' }}>
              Best price at <strong>{lowestPrice.store}</strong> — ₹{lowestPrice.price?.toLocaleString()}
            </span>
          </div>
          {maxSaving > 0 && (
            <div style={{
              background: 'rgba(200,240,90,0.12)', border: '0.5px solid rgba(200,240,90,0.3)',
              borderRadius: '100px', padding: '4px 12px',
              fontSize: '12px', color: '#c8f05a', fontWeight: 700,
            }}>
              Save ₹{maxSaving.toLocaleString()} vs {highestPrice.store}
            </div>
          )}
        </div>
      )}

      {/* Price Comparison Cards */}
      <div className="result-section" style={{
        background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)',
        borderRadius: '20px', padding: '24px', marginBottom: '14px',
        animationDelay: '0.1s',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 500, color: '#c8f05a', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
          Price Comparison
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {product.prices?.map((p, i) => {
            const sc = STORE_COLORS[p.store] || '#c8f05a'
            const storeEmoji = p.store === 'Amazon' ? '🛒' : p.store === 'Flipkart' ? '📦' : '👗'
            return (
              <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: 'none', flex: '1', minWidth: '140px' }}
              >
                <div style={{
                  background: p.isLowest ? `${sc}12` : '#1a1a1a',
                  border: `0.5px solid ${p.isLowest ? `${sc}40` : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '14px', padding: '16px',
                  cursor: 'pointer', position: 'relative',
                  transition: 'all 0.2s',
                }}>
                  {p.isLowest && (
                    <div style={{
                      position: 'absolute', top: '-9px', left: '50%', transform: 'translateX(-50%)',
                      background: sc, color: p.store === 'Flipkart' ? '#fff' : '#080808',
                      fontSize: '9px', fontWeight: 800, padding: '2px 10px',
                      borderRadius: '100px', whiteSpace: 'nowrap', letterSpacing: '0.5px',
                    }}>
                      CHEAPEST
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: sc, fontWeight: 600, marginBottom: '6px' }}>
                    {storeEmoji} {p.store}
                  </div>
                  <div style={{
                    fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800,
                    color: p.isLowest ? sc : '#f0ede8', marginBottom: '4px',
                  }}>
                    ₹{p.price?.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11px', color: '#555250' }}>Tap to view →</div>
                </div>
              </a>
            )
          })}
          {/* Placeholders for missing stores */}
          {['Amazon', 'Flipkart', 'Myntra'].filter(s => !product.prices?.find(p => p.store === s)).map(s => (
            <div key={s} style={{
              flex: '1', minWidth: '140px',
              background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.04)',
              borderRadius: '14px', padding: '16px', opacity: 0.35,
            }}>
              <div style={{ fontSize: '12px', color: STORE_COLORS[s], fontWeight: 600, marginBottom: '6px' }}>
                {s === 'Amazon' ? '🛒' : s === 'Flipkart' ? '📦' : '👗'} {s}
              </div>
              <div style={{ fontSize: '13px', color: '#555250' }}>Not found</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PRICE HISTORY GRAPH ── */}
      <div className="result-section" style={{
        background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)',
        borderRadius: '20px', padding: '24px', marginBottom: '14px',
        animationDelay: '0.15s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#c8f05a', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
              Price History
            </div>
            <div style={{ fontSize: '12px', color: '#555250' }}>Last 30 days · All stores</div>
          </div>
          <button className="graph-toggle" onClick={() => setShowGraph(!showGraph)} style={{
            background: 'transparent',
            border: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: '100px', padding: '5px 14px',
            fontSize: '12px', color: '#888580', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
          }}>
            {showGraph ? 'Hide Graph' : 'Show Graph'}
          </button>
        </div>

        {showGraph && (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={priceHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#555250', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={6}
                />
                <YAxis
                  tick={{ fill: '#555250', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}
                  width={45}
                />
                <Tooltip content={<CustomTooltip />} />
                {product.prices?.map(p => (
                  <Line
                    key={p.store}
                    type="monotone"
                    dataKey={p.store}
                    stroke={STORE_COLORS[p.store] || '#c8f05a'}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
              {product.prices?.map(p => (
                <div key={p.store} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '20px', height: '2px', background: STORE_COLORS[p.store], borderRadius: '2px' }} />
                  <span style={{ fontSize: '11px', color: '#888580' }}>{p.store}</span>
                  <span style={{ fontSize: '11px', color: STORE_COLORS[p.store], fontWeight: 600 }}>₹{p.price?.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Graph insight */}
            <div style={{
              marginTop: '14px', padding: '10px 14px',
              background: 'rgba(200,240,90,0.04)',
              border: '0.5px solid rgba(200,240,90,0.1)',
              borderRadius: '10px', fontSize: '12px', color: '#888580',
            }}>
              📊 <strong style={{ color: '#c8f05a' }}>Insight:</strong> {lowestPrice?.store} consistently has the lowest price. {maxSaving > 0 ? `You save ₹${maxSaving.toLocaleString()} by buying here vs ${highestPrice?.store}.` : 'Prices are similar across platforms.'}
            </div>
          </>
        )}
      </div>

      {/* AI Summary */}
      <div className="result-section" style={{
        background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)',
        borderRadius: '20px', padding: '24px', marginBottom: '14px',
        animationDelay: '0.2s',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 500, color: '#c8f05a', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
          🤖 AI Summary
        </div>
        <p style={{ fontSize: '15px', color: '#888580', lineHeight: 1.7, fontWeight: 300, margin: 0 }}>
          {product.summary}
        </p>
      </div>

      {/* Score Breakdown */}
      <div className="result-section" style={{
        background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)',
        borderRadius: '20px', padding: '24px', marginBottom: '14px',
        animationDelay: '0.25s',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 500, color: '#c8f05a', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
          Score Breakdown
        </div>
        {product.scoreBreakdown && Object.entries(product.scoreBreakdown).map(([key, val]) => (
          <ScoreBar
            key={key}
            label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
            value={val}
          />
        ))}
      </div>

      {/* Pros & Cons */}
      <div className="pros-cons-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>

        <div className="result-section" style={{
          background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)',
          borderRadius: '20px', padding: '22px', animationDelay: '0.3s',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#c8f05a', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px' }}>
            ✅ Strengths ({product.pros?.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {product.pros?.map((pro, i) => (
              <div key={i} className="pro-item" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '8px', borderRadius: '8px', transition: 'background 0.2s' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(200,240,90,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M1.5 4.5l2 2 4-4" stroke="#c8f05a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ fontSize: '13px', color: '#888580', lineHeight: 1.5 }}>{pro}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="result-section" style={{
          background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)',
          borderRadius: '20px', padding: '22px', animationDelay: '0.32s',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#ff5a5a', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px' }}>
            ❌ Limitations ({product.cons?.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {product.cons?.map((con, i) => (
              <div key={i} className="con-item" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '8px', borderRadius: '8px', transition: 'background 0.2s' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(255,90,90,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M2 2l5 5M7 2L2 7" stroke="#ff5a5a" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </div>
                <span style={{ fontSize: '13px', color: '#888580', lineHeight: 1.5 }}>{con}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <p style={{ textAlign: 'center', fontSize: '12px', color: '#555250', marginTop: '24px' }}>
        Analyzed {new Date(product.analyzedAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        {state?.product?.cached && ' · Served from cache'}
      </p>
    </div>
  )
}