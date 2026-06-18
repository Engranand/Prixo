import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const CATEGORY_META = {
  smartphones: { emoji: '📱', label: 'Smartphones', queries: ['Samsung Galaxy S24', 'iPhone 15', 'OnePlus 12R', 'Redmi Note 13 Pro', 'Realme 12 Pro'] },
  laptops: { emoji: '💻', label: 'Laptops', queries: ['HP Pavilion laptop', 'Dell Inspiron 15', 'Lenovo IdeaPad Slim 5', 'ASUS VivoBook 15', 'Acer Aspire 7'] },
  earphones: { emoji: '🎧', label: 'Earphones', queries: ['boAt Airdopes 141', 'Sony WH-1000XM5', 'JBL Tune 230NC', 'Noise Buds VS104', 'OnePlus Buds Z2'] },
  footwear: { emoji: '👟', label: 'Footwear', queries: ['Nike Air Max sneakers', 'Adidas running shoes', 'Puma walking shoes', 'Campus shoes', 'Skechers Go Walk'] },
  skincare: { emoji: '🌿', label: 'Skincare', queries: ['Minimalist niacinamide serum', 'Dot Key sunscreen', 'Cetaphil moisturizer', 'Mamaearth face wash', 'The Derma Co vitamin c'] },
  cameras: { emoji: '📷', label: 'Cameras', queries: ['Canon EOS 1500D', 'Sony Alpha ZV-E10', 'Nikon D3500', 'GoPro Hero 12', 'Fujifilm Instax Mini'] },
  smartwatches: { emoji: '⌚', label: 'Smartwatches', queries: ['Fire-Boltt smartwatch', 'boAt Wave Call Pro', 'Samsung Galaxy Watch 6', 'Noise ColorFit Pro 5', 'Amazfit Bip 5'] },
  'home-kitchen': { emoji: '🏠', label: 'Home & Kitchen', queries: ['Prestige pressure cooker', 'Philips air fryer', 'Milton water bottle', 'Butterfly mixer grinder', 'Pigeon induction cooktop'] },
}

const STORE_COLORS = {
  Amazon: { color: '#FF9900', bg: '#FF990015', border: '#FF990040' },
  Flipkart: { color: '#2874F0', bg: '#2874F015', border: '#2874F040' },
  Myntra: { color: '#FF3F6C', bg: '#FF3F6C15', border: '#FF3F6C40' },
}

const STORE_EMOJI = { Amazon: '🛒', Flipkart: '📦', Myntra: '👗' }

export default function Category() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const meta = CATEGORY_META[slug]

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingIndex, setLoadingIndex] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!meta) { navigate('/'); return }
    fetchCategoryProducts()
  }, [slug])

  const fetchCategoryProducts = async () => {
    setLoading(true)
    setProducts([])
    setError('')

    const results = []
    for (let i = 0; i < meta.queries.length; i++) {
      setLoadingIndex(i + 1)
      try {
        const { data } = await axios.post('/api/product/category-search', {
          query: meta.queries[i],
          category: meta.label,
        })
        if (data.success && data.product) {
          results.push(data.product)
          setProducts([...results])
        }
      } catch (e) {
        console.log('Skip:', meta.queries[i])
      }
    }

    if (results.length === 0) setError('No products found. Try again.')
    setLoading(false)
  }

  if (!meta) return null

  const verdictColor = (v) => ({
    'Excellent Buy': '#c8f05a',
    'Good Buy': '#c8f05a',
    'Average Buy': '#ffb432',
    'Skip This': '#ff5a5a',
  }[v] || '#c8f05a')

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px 80px' }}>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        .cat-product-card { animation: fadeUp 0.4s ease both; transition: border-color 0.2s, transform 0.2s; }
        .cat-product-card:hover { border-color: rgba(200,240,90,0.2) !important; transform: translateY(-2px); }
        .store-row { transition: background 0.15s; }
        .store-row:hover { background: rgba(255,255,255,0.03) !important; }
        .btn-back:hover { border-color: rgba(255,255,255,0.25) !important; color: #f0ede8 !important; }
        .shimmer-box {
          background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 12px;
        }
      `}</style>

      {/* Back */}
      <button className="btn-back" onClick={() => navigate('/')} style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)',
        borderRadius: '100px', color: '#888580', fontSize: '13px',
        padding: '7px 16px', cursor: 'pointer',
        fontFamily: 'DM Sans, sans-serif', marginBottom: '32px',
        transition: 'all 0.2s',
      }}>
        ← Back to search
      </button>

      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>{meta.emoji}</div>
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '10px',
        }}>
          Best <span style={{ color: '#c8f05a' }}>{meta.label}</span>
        </h1>
        <p style={{ color: '#888580', fontSize: '15px', fontWeight: 300 }}>
          Top picks compared across Amazon, Flipkart & Myntra — cheapest highlighted ✅
        </p>
      </div>

      {/* Loading status */}
      {loading && (
        <div style={{
          background: 'rgba(200,240,90,0.06)', border: '0.5px solid rgba(200,240,90,0.2)',
          borderRadius: '12px', padding: '12px 20px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#c8f05a', animation: 'pulse 1s infinite',
          }} />
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
          <span style={{ fontSize: '13px', color: '#c8f05a' }}>
            Searching product {loadingIndex} of {meta.queries.length} across all stores…
          </span>
        </div>
      )}

      {/* Skeleton cards while loading first results */}
      {loading && products.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)',
              borderRadius: '20px', padding: '24px', display: 'flex', gap: '20px',
            }}>
              <div className="shimmer-box" style={{ width: '100px', height: '100px', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="shimmer-box" style={{ height: '18px', width: '60%' }} />
                <div className="shimmer-box" style={{ height: '14px', width: '40%' }} />
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  {[1, 2, 3].map(j => <div key={j} className="shimmer-box" style={{ height: '56px', flex: 1, borderRadius: '10px' }} />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {products.map((product, idx) => {
          const prices = product.prices || []
          const lowest = prices.reduce((a, b) => a.price < b.price ? a : b, prices[0])
          const highest = prices.reduce((a, b) => a.price > b.price ? a : b, prices[0])
          const saving = highest && lowest && highest.store !== lowest.store
            ? highest.price - lowest.price : 0

          return (
            <div key={idx} className="cat-product-card" style={{
              background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)',
              borderRadius: '20px', padding: '24px',
              animationDelay: `${idx * 0.08}s`,
            }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

                {/* Product Image */}
                <div style={{
                  width: '100px', height: '100px', flexShrink: 0,
                  background: '#1e1e1e', borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  {product.image ? (
                    <img src={product.image} alt={product.title}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                    />
                  ) : null}
                  <div style={{ display: product.image ? 'none' : 'flex', fontSize: '36px', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                    {meta.emoji}
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                    <h3 style={{
                      fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700,
                      lineHeight: 1.35, letterSpacing: '-0.2px',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {product.title}
                    </h3>
                    <div style={{
                      flexShrink: 0,
                      background: `${verdictColor(product.verdict)}15`,
                      border: `0.5px solid ${verdictColor(product.verdict)}40`,
                      borderRadius: '100px', padding: '3px 10px',
                      fontSize: '11px', color: verdictColor(product.verdict), fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}>
                      {product.aiScore}/100
                    </div>
                  </div>

                  {/* Saving badge */}
                  {saving > 0 && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      background: 'rgba(200,240,90,0.08)', border: '0.5px solid rgba(200,240,90,0.2)',
                      borderRadius: '8px', padding: '4px 10px', marginBottom: '12px',
                      fontSize: '12px', color: '#c8f05a',
                    }}>
                      💰 Save ₹{saving.toLocaleString()} by buying on {lowest?.store}
                    </div>
                  )}

                  {/* Store Price Cards */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {prices.map((p, pi) => {
                      const sc = STORE_COLORS[p.store] || STORE_COLORS.Amazon
                      return (
                        <a key={pi} href={p.url} target="_blank" rel="noopener noreferrer"
                          style={{ textDecoration: 'none', flex: '1', minWidth: '100px' }}
                        >
                          <div style={{
                            background: p.isLowest ? sc.bg : '#1a1a1a',
                            border: `0.5px solid ${p.isLowest ? sc.border : 'rgba(255,255,255,0.07)'}`,
                            borderRadius: '12px', padding: '10px 12px',
                            cursor: 'pointer', transition: 'all 0.2s',
                            position: 'relative',
                          }}>
                            {p.isLowest && (
                              <div style={{
                                position: 'absolute', top: '-8px', left: '50%',
                                transform: 'translateX(-50%)',
                                background: sc.color, color: '#fff',
                                fontSize: '9px', fontWeight: 700,
                                padding: '2px 8px', borderRadius: '100px',
                                whiteSpace: 'nowrap',
                              }}>
                                CHEAPEST
                              </div>
                            )}
                            <div style={{ fontSize: '11px', color: sc.color, fontWeight: 600, marginBottom: '4px' }}>
                              {STORE_EMOJI[p.store]} {p.store}
                            </div>
                            <div style={{
                              fontFamily: 'Syne, sans-serif', fontSize: '16px',
                              fontWeight: 800, color: p.isLowest ? sc.color : '#f0ede8',
                            }}>
                              ₹{p.price?.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '10px', color: '#555250', marginTop: '2px' }}>
                              View →
                            </div>
                          </div>
                        </a>
                      )
                    })}

                    {/* Placeholder if store not found */}
                    {['Amazon', 'Flipkart', 'Myntra'].filter(s => !prices.find(p => p.store === s)).map(s => {
                      const sc = STORE_COLORS[s]
                      return (
                        <div key={s} style={{
                          flex: '1', minWidth: '100px',
                          background: '#1a1a1a',
                          border: '0.5px solid rgba(255,255,255,0.05)',
                          borderRadius: '12px', padding: '10px 12px',
                          opacity: 0.4,
                        }}>
                          <div style={{ fontSize: '11px', color: sc.color, fontWeight: 600, marginBottom: '4px' }}>
                            {STORE_EMOJI[s]} {s}
                          </div>
                          <div style={{ fontSize: '13px', color: '#555250' }}>Not found</div>
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

      {/* Error */}
      {!loading && error && (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          color: '#555250', fontSize: '15px',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>😕</div>
          <div>{error}</div>
          <button onClick={fetchCategoryProducts} style={{
            marginTop: '20px', padding: '10px 24px',
            background: '#c8f05a', color: '#080808',
            border: 'none', borderRadius: '100px',
            fontSize: '13px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Syne, sans-serif',
          }}>
            Try Again
          </button>
        </div>
      )}

      {/* Done */}
      {!loading && products.length > 0 && (
        <div style={{
          textAlign: 'center', marginTop: '32px',
          fontSize: '13px', color: '#555250',
        }}>
          Showing {products.length} products · Prices fetched live from all 3 stores
        </div>
      )}
    </div>
  )
}
