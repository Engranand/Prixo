import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const PLATFORMS = {
  Zepto:     { color: '#9B5DE5', bg: '#9B5DE512', border: '#9B5DE540', emoji: '⚡', delivery: '10 mins' },
  Blinkit:   { color: '#F9C74F', bg: '#F9C74F12', border: '#F9C74F40', emoji: '🟡', delivery: '10 mins' },
  BigBasket: { color: '#4CAF50', bg: '#4CAF5012', border: '#4CAF5040', emoji: '🟢', delivery: '2 hrs' },
}

export default function GrocerySearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''

  const [input, setInput] = useState(query)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')

  useEffect(() => {
    if (query) { setInput(query); doSearch(query) }
  }, [query])

  const doSearch = async (q) => {
    setLoading(true)
    setResults([])
    setSearched(false)

    const items = []

    // Search across all 3 platforms via backend
    const platforms = ['Zepto', 'Blinkit', 'BigBasket']
    for (const platform of platforms) {
      setLoadingMsg(`Checking ${platform}…`)
      try {
        const { data } = await axios.post('/api/grocery/search', { query: q, platform })
        if (data.success && data.products?.length > 0) {
          // Merge into items array by product name
          data.products.forEach(p => {
            const existing = items.find(i =>
              i.name.toLowerCase().includes(p.name.toLowerCase().slice(0, 10)) ||
              p.name.toLowerCase().includes(i.name.toLowerCase().slice(0, 10))
            )
            if (existing) {
              existing.prices[platform] = {
                price: p.price,
                mrp: p.mrp,
                deliveryFee: p.deliveryFee,
                totalCost: p.price + p.deliveryFee,
                url: p.url,
                image: p.image || existing.image,
              }
            } else {
              items.push({
                name: p.name,
                image: p.image,
                unit: p.unit,
                prices: {
                  [platform]: {
                    price: p.price,
                    mrp: p.mrp,
                    deliveryFee: p.deliveryFee,
                    totalCost: p.price + p.deliveryFee,
                    url: p.url,
                    image: p.image,
                  }
                }
              })
            }
          })
          setResults([...items])
        }
      } catch (e) {
        console.log(`${platform} error:`, e.message)
      }
    }

    setLoadingMsg('')
    setLoading(false)
    setSearched(true)
  }

  const handleSearch = () => {
    if (!input.trim()) return
    setSearchParams({ q: input.trim() })
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSearch() }

  const getCheapest = (prices) => {
    const entries = Object.entries(prices).filter(([, v]) => v?.totalCost > 0)
    if (!entries.length) return null
    return entries.reduce((a, b) => a[1].totalCost < b[1].totalCost ? a : b)[0]
  }

  const getSaving = (prices) => {
    const costs = Object.values(prices).filter(v => v?.totalCost > 0).map(v => v.totalCost)
    if (costs.length < 2) return 0
    return Math.max(...costs) - Math.min(...costs)
  }

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '40px 32px 80px' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .shimmer { background:linear-gradient(90deg,#1a1a1a 25%,#252525 50%,#1a1a1a 75%); background-size:400px 100%; animation:shimmer 1.4s infinite; border-radius:10px; }
        .g-result-card { animation:fadeUp 0.35s ease both; transition:border-color 0.2s,transform 0.2s; }
        .g-result-card:hover { border-color:rgba(155,93,229,0.2) !important; transform:translateY(-2px); }
        .platform-card { transition:all 0.18s; }
        .platform-card:hover { transform:translateY(-2px); opacity:0.9; }
        .g-search:focus-within { border-color:rgba(155,93,229,0.45) !important; box-shadow:0 0 0 3px rgba(155,93,229,0.08); }
        .btn-back:hover { color:#f0ede8 !important; }
      `}</style>

      {/* Back */}
      <button className="btn-back" onClick={() => navigate('/grocery')} style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)',
        borderRadius: '100px', color: '#888580', fontSize: '13px',
        padding: '7px 16px', cursor: 'pointer',
        fontFamily: 'DM Sans, sans-serif', marginBottom: '28px', transition: 'color 0.2s',
      }}>
        ← Back to Grocery
      </button>

      {/* Search bar */}
      <div className="g-search" style={{
        background: '#161616', border: '0.5px solid rgba(255,255,255,0.12)',
        borderRadius: '28px', padding: '6px 6px 6px 20px',
        display: 'flex', alignItems: 'center', gap: '12px',
        marginBottom: '12px', transition: 'all 0.2s',
      }}>
        <span style={{ fontSize: '16px', flexShrink: 0 }}>🔍</span>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Search grocery product…"
          autoFocus
          style={{
            flex: 1, background: 'transparent', border: 'none',
            outline: 'none', color: '#f0ede8',
            fontSize: '15px', fontFamily: 'DM Sans, sans-serif',
          }}
        />
        <button onClick={handleSearch} disabled={loading} style={{
          padding: '10px 24px', border: 'none', borderRadius: '100px',
          background: '#9B5DE5', color: '#fff',
          fontSize: '13px', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'Syne, sans-serif', opacity: loading ? 0.6 : 1,
          transition: 'all 0.2s',
        }}>
          {loading ? 'Searching…' : 'Compare →'}
        </button>
      </div>

      {/* Platform badges */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {Object.entries(PLATFORMS).map(([name, p]) => (
          <span key={name} style={{
            fontSize: '11px', fontWeight: 600, padding: '3px 10px',
            borderRadius: '100px', border: `0.5px solid ${p.border}`,
            color: p.color, background: p.bg,
          }}>
            {p.emoji} {name} · {p.delivery}
          </span>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(155,93,229,0.05)',
            border: '0.5px solid rgba(155,93,229,0.2)',
            borderRadius: '12px', padding: '12px 20px', marginBottom: '24px',
          }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#9B5DE5', animation: 'pulse 1s infinite' }} />
            <span style={{ fontSize: '13px', color: '#9B5DE5' }}>
              {loadingMsg || `Comparing prices for "${query}"…`}
            </span>
          </div>

          {/* Skeletons */}
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              background: '#161616', border: '0.5px solid rgba(255,255,255,0.06)',
              borderRadius: '20px', padding: '24px', marginBottom: '14px',
              display: 'flex', gap: '18px',
            }}>
              <div className="shimmer" style={{ width: '90px', height: '90px', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="shimmer" style={{ height: '16px', width: '50%' }} />
                <div className="shimmer" style={{ height: '12px', width: '25%' }} />
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  {[1, 2, 3].map(j => <div key={j} className="shimmer" style={{ flex: 1, height: '80px' }} />)}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Results */}
      {results.length > 0 && (
        <>
          {!loading && (
            <div style={{ fontSize: '13px', color: '#555250', marginBottom: '18px' }}>
              <span style={{ color: '#9B5DE5', fontWeight: 600 }}>{results.length} products</span> found for "{query}"
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {results.map((item, idx) => {
              const cheapest = getCheapest(item.prices)
              const saving = getSaving(item.prices)

              return (
                <div key={idx} className="g-result-card" style={{
                  background: '#161616',
                  border: '0.5px solid rgba(255,255,255,0.07)',
                  borderRadius: '20px', padding: '22px',
                  animationDelay: `${idx * 0.06}s`,
                }}>
                  <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>

                    {/* Image */}
                    <div style={{
                      width: '90px', height: '90px', flexShrink: 0,
                      background: '#1e1e1e', borderRadius: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      {item.image
                        ? <img src={item.image} alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={e => { e.target.style.display = 'none' }}
                          />
                        : <span style={{ fontSize: '30px' }}>🛒</span>
                      }
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <h3 style={{
                            fontFamily: 'Syne, sans-serif', fontSize: '15px',
                            fontWeight: 700, letterSpacing: '-0.2px', marginBottom: '3px',
                          }}>
                            {item.name}
                          </h3>
                          {item.unit && (
                            <span style={{ fontSize: '12px', color: '#555250' }}>{item.unit}</span>
                          )}
                        </div>

                        {saving > 5 && (
                          <div style={{
                            background: 'rgba(155,93,229,0.1)',
                            border: '0.5px solid rgba(155,93,229,0.25)',
                            borderRadius: '8px', padding: '4px 12px',
                            fontSize: '12px', color: '#9B5DE5', fontWeight: 600,
                            whiteSpace: 'nowrap', flexShrink: 0, marginLeft: '12px',
                          }}>
                            Save ₹{saving.toFixed(0)}
                          </div>
                        )}
                      </div>

                      {/* Platform price cards */}
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {Object.entries(PLATFORMS).map(([platform, pc]) => {
                          const pd = item.prices[platform]
                          const isCheapest = cheapest === platform

                          if (!pd) {
                            return (
                              <div key={platform} style={{
                                flex: '1', minWidth: '130px',
                                background: '#1a1a1a',
                                border: '0.5px solid rgba(255,255,255,0.04)',
                                borderRadius: '12px', padding: '12px 14px',
                                opacity: 0.35,
                              }}>
                                <div style={{ fontSize: '11px', color: pc.color, fontWeight: 600, marginBottom: '4px' }}>
                                  {pc.emoji} {platform}
                                </div>
                                <div style={{ fontSize: '12px', color: '#555250' }}>Not available</div>
                              </div>
                            )
                          }

                          return (
                            <a key={platform} href={pd.url || `https://www.${platform.toLowerCase()}.com`}
                              target="_blank" rel="noopener noreferrer"
                              style={{ textDecoration: 'none', flex: '1', minWidth: '130px' }}
                            >
                              <div className="platform-card" style={{
                                background: isCheapest ? pc.bg : '#1a1a1a',
                                border: `0.5px solid ${isCheapest ? pc.border : 'rgba(255,255,255,0.06)'}`,
                                borderRadius: '12px', padding: '12px 14px',
                                cursor: 'pointer', position: 'relative',
                              }}>
                                {isCheapest && (
                                  <div style={{
                                    position: 'absolute', top: '-9px', left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: pc.color, color: platform === 'Blinkit' ? '#080808' : '#fff',
                                    fontSize: '9px', fontWeight: 800,
                                    padding: '2px 9px', borderRadius: '100px',
                                    whiteSpace: 'nowrap', letterSpacing: '0.5px',
                                  }}>
                                    CHEAPEST
                                  </div>
                                )}

                                <div style={{ fontSize: '11px', color: pc.color, fontWeight: 600, marginBottom: '5px' }}>
                                  {pc.emoji} {platform}
                                </div>

                                {/* Price */}
                                <div style={{
                                  fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 800,
                                  color: isCheapest ? pc.color : '#f0ede8', marginBottom: '4px',
                                }}>
                                  ₹{pd.price?.toLocaleString()}
                                </div>

                                {/* MRP strikethrough */}
                                {pd.mrp > pd.price && (
                                  <div style={{ fontSize: '11px', color: '#555250', textDecoration: 'line-through', marginBottom: '4px' }}>
                                    MRP ₹{pd.mrp}
                                  </div>
                                )}

                                {/* Delivery */}
                                <div style={{
                                  fontSize: '10px', color: '#888580',
                                  borderTop: '0.5px solid rgba(255,255,255,0.06)',
                                  paddingTop: '5px', marginTop: '4px',
                                }}>
                                  {pd.deliveryFee === 0
                                    ? <span style={{ color: '#4CAF50' }}>✓ Free delivery</span>
                                    : `+ ₹${pd.deliveryFee} delivery`
                                  }
                                </div>

                                {/* Total */}
                                <div style={{ fontSize: '11px', fontWeight: 600, color: '#888580', marginTop: '3px' }}>
                                  Total: ₹{pd.totalCost?.toFixed(0)}
                                </div>

                                <div style={{ fontSize: '10px', color: '#555250', marginTop: '4px' }}>
                                  {pc.delivery} · Tap to order →
                                </div>
                              </div>
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {!loading && (
            <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '12px', color: '#555250' }}>
              Prices are live · Delivery charges may vary by location · Always check app for final price
            </div>
          )}
        </>
      )}

      {/* Empty */}
      {searched && !loading && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '70px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
            No results found
          </div>
          <div style={{ fontSize: '14px', color: '#555250', marginBottom: '24px' }}>
            Try "Amul milk", "Tata salt", "Patanjali atta" etc.
          </div>
          <button onClick={() => { setInput(''); document.querySelector('input').focus() }} style={{
            padding: '10px 24px', background: '#9B5DE5', color: '#fff',
            border: 'none', borderRadius: '100px', fontSize: '13px',
            fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne, sans-serif',
          }}>
            Search Again
          </button>
        </div>
      )}
    </div>
  )
}