import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const STORE_COLORS = {
  Amazon:   { color: '#FF9900', bg: '#FF990012', border: '#FF990035' },
  Flipkart: { color: '#2874F0', bg: '#2874F012', border: '#2874F035' },
  Myntra:   { color: '#FF3F6C', bg: '#FF3F6C12', border: '#FF3F6C35' },
}
const STORE_EMOJI = { Amazon: '🛒', Flipkart: '📦', Myntra: '👗' }

const verdictColor = (v) => ({
  'Excellent Buy': '#c8f05a',
  'Good Buy': '#c8f05a',
  'Average Buy': '#ffb432',
  'Skip This': '#ff5a5a',
}[v] || '#c8f05a')

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''

  const [input, setInput] = useState(query)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (query) {
      setInput(query)
      doSearch(query)
    }
  }, [query])

  const doSearch = async (q) => {
    if (!q.trim()) return
    setLoading(true)
    setProducts([])
    setSearched(false)

    // Generate 4 variations of the query for richer results
    const queries = [
      q,
      `best ${q}`,
      `${q} under 2000`,
      `popular ${q} india`,
    ]

    const results = []
    for (const qr of queries) {
      try {
        const { data } = await axios.post('/api/product/category-search', {
          query: qr,
          category: 'Search',
        })
        if (data.success && data.product && data.product.prices?.length > 0) {
          // Avoid duplicates by title similarity
          const isDupe = results.some(r =>
            r.title.toLowerCase().slice(0, 20) === data.product.title.toLowerCase().slice(0, 20)
          )
          if (!isDupe) {
            results.push(data.product)
            setProducts([...results])
          }
        }
      } catch {}
    }

    setLoading(false)
    setSearched(true)
  }

  const handleSearch = () => {
    if (!input.trim()) return
    setSearchParams({ q: input.trim() })
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 32px 80px' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .shimmer-box {
          background: linear-gradient(90deg,#1a1a1a 25%,#252525 50%,#1a1a1a 75%);
          background-size: 400px 100%; animation: shimmer 1.4s infinite; border-radius: 10px;
        }
        .result-card { animation: fadeUp 0.35s ease both; transition: border-color 0.2s, transform 0.2s; }
        .result-card:hover { border-color: rgba(200,240,90,0.18) !important; transform: translateY(-2px); }
        .store-pill:hover { opacity: 0.85; transform: translateY(-1px); }
        .search-bar:focus-within { border-color: rgba(200,240,90,0.4) !important; }
        .btn-back:hover { color: #f0ede8 !important; border-color: rgba(255,255,255,0.25) !important; }
      `}</style>

      {/* Back */}
      <button className="btn-back" onClick={() => navigate('/')} style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)',
        borderRadius: '100px', color: '#888580', fontSize: '13px',
        padding: '7px 16px', cursor: 'pointer',
        fontFamily: 'DM Sans, sans-serif', marginBottom: '28px',
        transition: 'all 0.2s',
      }}>
        ← Back
      </button>

      {/* Search Bar */}
      <div className="search-bar" style={{
        background: '#161616', border: '0.5px solid rgba(255,255,255,0.12)',
        borderRadius: '28px', padding: '6px 6px 6px 20px',
        display: 'flex', alignItems: 'center', gap: '12px',
        marginBottom: '12px', transition: 'border-color 0.2s',
      }}>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="9" cy="9" r="6.5" stroke="#555250" strokeWidth="1.5" />
          <path d="M14 14l4 4" stroke="#555250" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Search any product — shoes, laptop, earphones…"
          autoFocus
          style={{
            flex: 1, background: 'transparent', border: 'none',
            outline: 'none', color: '#f0ede8',
            fontSize: '15px', fontFamily: 'DM Sans, sans-serif',
          }}
        />
        <button onClick={handleSearch} disabled={loading} style={{
          padding: '10px 24px', border: 'none', borderRadius: '100px',
          background: '#c8f05a', color: '#080808',
          fontSize: '13px', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'Syne, sans-serif', whiteSpace: 'nowrap',
          opacity: loading ? 0.6 : 1, transition: 'all 0.2s',
        }}>
          {loading ? 'Searching…' : 'Search →'}
        </button>
      </div>

      {/* Store badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
        <span style={{ fontSize: '11px', color: '#555250' }}>Searching on:</span>
        {Object.entries(STORE_COLORS).map(([s, c]) => (
          <span key={s} style={{
            fontSize: '11px', fontWeight: 600, padding: '3px 10px',
            borderRadius: '100px', border: `0.5px solid ${c.border}`,
            color: c.color, background: c.bg,
          }}>
            {STORE_EMOJI[s]} {s}
          </span>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(200,240,90,0.05)',
            border: '0.5px solid rgba(200,240,90,0.15)',
            borderRadius: '12px', padding: '12px 20px', marginBottom: '24px',
          }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#c8f05a', animation: 'pulse 1s infinite' }} />
            <span style={{ fontSize: '13px', color: '#c8f05a' }}>
              Searching "{query}" across Amazon, Flipkart & Myntra…
            </span>
          </div>

          {/* Skeleton cards */}
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)',
              borderRadius: '20px', padding: '24px', marginBottom: '14px',
              display: 'flex', gap: '20px',
            }}>
              <div className="shimmer-box" style={{ width: '100px', height: '100px', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="shimmer-box" style={{ height: '18px', width: '55%' }} />
                <div className="shimmer-box" style={{ height: '13px', width: '30%' }} />
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  {[1, 2, 3].map(j => <div key={j} className="shimmer-box" style={{ height: '64px', flex: 1 }} />)}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Results */}
      {products.length > 0 && (
        <>
          {!loading && (
            <div style={{ fontSize: '13px', color: '#555250', marginBottom: '20px' }}>
              Found <span style={{ color: '#c8f05a', fontWeight: 600 }}>{products.length} results</span> for "{query}"
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {products.map((product, idx) => {
              const prices = product.prices || []
              const lowest = prices.reduce((a, b) => a.price < b.price ? a : b, prices[0])
              const highest = prices.reduce((a, b) => a.price > b.price ? a : b, prices[0])
              const saving = highest && lowest && highest.store !== lowest.store
                ? highest.price - lowest.price : 0

              return (
                <div key={idx} className="result-card" style={{
                  background: '#161616',
                  border: '0.5px solid rgba(255,255,255,0.07)',
                  borderRadius: '20px', padding: '22px',
                  animationDelay: `${idx * 0.07}s`,
                }}>
                  <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>

                    {/* Image */}
                    <div style={{
                      width: '96px', height: '96px', flexShrink: 0,
                      background: '#1e1e1e', borderRadius: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      {product.image
                        ? <img src={product.image} alt={product.title}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={e => { e.target.style.display = 'none' }}
                          />
                        : <span style={{ fontSize: '32px' }}>🛍️</span>
                      }
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>

                      {/* Title row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                        <h3 style={{
                          fontFamily: 'Syne, sans-serif', fontSize: '15px',
                          fontWeight: 700, lineHeight: 1.35, letterSpacing: '-0.2px',
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {product.title}
                        </h3>
                        <div style={{
                          flexShrink: 0,
                          fontSize: '11px', fontWeight: 700,
                          color: verdictColor(product.verdict),
                          background: `${verdictColor(product.verdict)}15`,
                          border: `0.5px solid ${verdictColor(product.verdict)}40`,
                          borderRadius: '100px', padding: '3px 10px',
                          whiteSpace: 'nowrap',
                        }}>
                          {product.verdict || 'Good Buy'}
                        </div>
                      </div>

                      {/* Saving badge */}
                      {saving > 500 && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          background: 'rgba(200,240,90,0.07)',
                          border: '0.5px solid rgba(200,240,90,0.2)',
                          borderRadius: '8px', padding: '4px 10px', marginBottom: '12px',
                          fontSize: '12px', color: '#c8f05a', fontWeight: 500,
                        }}>
                          💰 ₹{saving.toLocaleString()} sasta on {lowest?.store} vs {highest?.store}
                        </div>
                      )}

                      {/* Store Price Pills */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {prices.map((p, pi) => {
                          const sc = STORE_COLORS[p.store] || STORE_COLORS.Amazon
                          return (
                            <a key={pi} href={p.url} target="_blank" rel="noopener noreferrer"
                              style={{ textDecoration: 'none' }}
                            >
                              <div className="store-pill" style={{
                                background: p.isLowest ? sc.bg : '#1c1c1c',
                                border: `0.5px solid ${p.isLowest ? sc.border : 'rgba(255,255,255,0.06)'}`,
                                borderRadius: '12px', padding: '10px 14px',
                                minWidth: '110px', cursor: 'pointer',
                                transition: 'all 0.18s', position: 'relative',
                              }}>
                                {p.isLowest && (
                                  <div style={{
                                    position: 'absolute', top: '-8px', left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: sc.color, color: '#fff',
                                    fontSize: '9px', fontWeight: 800,
                                    padding: '2px 8px', borderRadius: '100px',
                                    whiteSpace: 'nowrap', letterSpacing: '0.5px',
                                  }}>
                                    CHEAPEST
                                  </div>
                                )}
                                <div style={{ fontSize: '11px', color: sc.color, fontWeight: 600, marginBottom: '3px' }}>
                                  {STORE_EMOJI[p.store]} {p.store}
                                </div>
                                <div style={{
                                  fontFamily: 'Syne, sans-serif',
                                  fontSize: '17px', fontWeight: 800,
                                  color: p.isLowest ? sc.color : '#f0ede8',
                                }}>
                                  ₹{p.price?.toLocaleString()}
                                </div>
                                <div style={{ fontSize: '10px', color: '#555250', marginTop: '2px' }}>
                                  Tap to buy →
                                </div>
                              </div>
                            </a>
                          )
                        })}

                        {/* Missing stores */}
                        {['Amazon', 'Flipkart', 'Myntra']
                          .filter(s => !prices.find(p => p.store === s))
                          .map(s => {
                            const sc = STORE_COLORS[s]
                            return (
                              <div key={s} style={{
                                background: '#1a1a1a',
                                border: '0.5px solid rgba(255,255,255,0.04)',
                                borderRadius: '12px', padding: '10px 14px',
                                minWidth: '110px', opacity: 0.35,
                              }}>
                                <div style={{ fontSize: '11px', color: sc.color, fontWeight: 600, marginBottom: '3px' }}>
                                  {STORE_EMOJI[s]} {s}
                                </div>
                                <div style={{ fontSize: '13px', color: '#555250' }}>Not listed</div>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Empty state */}
      {searched && !loading && products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '70px 20px', color: '#555250' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <div style={{ fontSize: '18px', fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '8px', color: '#f0ede8' }}>
            No results found
          </div>
          <div style={{ fontSize: '14px', marginBottom: '24px' }}>
            Try a more specific product name, like "Nike Air Max" instead of "shoes"
          </div>
          <button onClick={() => { setInput(''); document.querySelector('input').focus() }} style={{
            padding: '10px 24px', background: '#c8f05a', color: '#080808',
            border: 'none', borderRadius: '100px',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Syne, sans-serif',
          }}>
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}