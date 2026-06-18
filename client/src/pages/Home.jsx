import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { emoji: '📱', name: 'Smartphones', count: '2,341', slug: 'smartphones' },
  { emoji: '💻', name: 'Laptops', count: '1,204', slug: 'laptops' },
  { emoji: '🎧', name: 'Earphones', count: '983', slug: 'earphones' },
  { emoji: '👟', name: 'Footwear', count: '756', slug: 'footwear' },
  { emoji: '🌿', name: 'Skincare', count: '612', slug: 'skincare' },
  { emoji: '📷', name: 'Cameras', count: '389', slug: 'cameras' },
  { emoji: '⌚', name: 'Smartwatches', count: '541', slug: 'smartwatches' },
  { emoji: '🏠', name: 'Home & Kitchen', count: '874', slug: 'home-kitchen' },
]

const TRENDING = [
  { rank: '01', emoji: '📱', name: 'Samsung Galaxy S24 Ultra', meta: 'Trending · Smartphones', price: '₹1,09,999', score: 91, store: 'Flipkart' },
  { rank: '02', emoji: '💻', name: 'Apple MacBook Air M3 13"', meta: 'Popular · Laptops', price: '₹1,14,900', score: 96, store: 'Amazon' },
  { rank: '03', emoji: '🎧', name: 'Sony WH-1000XM5 Headphones', meta: 'Best Seller · Audio', price: '₹24,990', score: 94, store: 'Amazon' },
  { rank: '04', emoji: '⌚', name: 'Apple Watch Series 9 GPS', meta: 'Hot Deal · Wearables', price: '₹41,900', score: 89, store: 'Myntra' },
  { rank: '05', emoji: '📷', name: 'Canon EOS R50 Mirrorless', meta: 'New · Cameras', price: '₹64,995', score: 87, store: 'Amazon' },
]

const STORE_COLORS = { Amazon: '#FF9900', Flipkart: '#2874F0', Myntra: '#FF3F6C' }

const ScoreDot = ({ score }) => {
  const color = score >= 85 ? '#c8f05a' : score >= 70 ? '#ffb432' : '#ff5a5a'
  return (
    <span style={{
      fontFamily: 'Syne, sans-serif', fontSize: '11px', fontWeight: 700,
      color, background: `${color}15`,
      border: `0.5px solid ${color}35`,
      borderRadius: '100px', padding: '2px 8px',
    }}>
      {score}
    </span>
  )
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [tab, setTab] = useState('url')
  const [loading, setLoading] = useState(false)

  // Price Drop Alert state
  const [alertEmail, setAlertEmail] = useState('')
  const [alertProduct, setAlertProduct] = useState('')
  const [alertPrice, setAlertPrice] = useState('')
  const [alertSet, setAlertSet] = useState(false)

  const navigate = useNavigate()

  const handleAnalyze = async () => {
    if (!url.trim()) return toast.error('Please enter something')
    if (tab === 'search') {
      navigate(`/search?q=${encodeURIComponent(url.trim())}`)
      return
    }
    const isValidUrl = url.includes('amazon') || url.includes('flipkart') || url.includes('myntra')
    if (!isValidUrl) return toast.error('Please enter a valid Amazon, Flipkart, or Myntra URL')
    setLoading(true)
    try {
      const { data } = await axios.post('/api/product/analyze', { url })
      if (data.success) navigate('/result', { state: { product: data.data } })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleAnalyze() }

  const handleSetAlert = () => {
    if (!alertEmail.trim()) return toast.error('Please enter your email')
    if (!alertProduct.trim()) return toast.error('Please enter product name')
    if (!alertPrice.trim()) return toast.error('Please enter your target price')
    setAlertSet(true)
    toast.success('🔔 Price alert set! We\'ll notify you when price drops.')
    setTimeout(() => { setAlertEmail(''); setAlertProduct(''); setAlertPrice(''); setAlertSet(false) }, 4000)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.75)} }
        @keyframes shimmer  { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes glow     { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes ticker   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        .hero-animate-1 { animation: fadeUp 0.6s 0.05s ease both; }
        .hero-animate-2 { animation: fadeUp 0.6s 0.15s ease both; }
        .hero-animate-3 { animation: fadeUp 0.6s 0.25s ease both; }
        .hero-animate-4 { animation: fadeUp 0.6s 0.35s ease both; }
        .hero-animate-5 { animation: fadeUp 0.6s 0.45s ease both; }

        .cat-card {
          transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
        }
        .cat-card:hover {
          border-color: rgba(200,240,90,0.3) !important;
          transform: translateY(-5px) scale(1.02);
          background: linear-gradient(135deg, rgba(200,240,90,0.06), rgba(200,240,90,0.02)) !important;
          box-shadow: 0 12px 32px rgba(200,240,90,0.08);
        }

        .trend-row {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .trend-row:hover {
          background: #161616 !important;
          border-color: rgba(255,255,255,0.1) !important;
          transform: translateX(6px);
        }

        .search-wrap:focus-within {
          border-color: rgba(200,240,90,0.5) !important;
          box-shadow: 0 0 0 4px rgba(200,240,90,0.07), 0 0 40px rgba(200,240,90,0.06);
        }

        .btn-analyze {
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-analyze:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(200,240,90,0.3);
        }
        .btn-analyze:disabled { opacity: 0.55; cursor: not-allowed; }

        .alert-input:focus {
          outline: none;
          border-color: rgba(255,180,50,0.5) !important;
          box-shadow: 0 0 0 3px rgba(255,180,50,0.07);
        }

        .tab-btn { transition: all 0.18s ease; }
        .tab-btn:hover { opacity: 0.8; }

        /* Noise texture overlay */
        .noise::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none; border-radius: inherit;
        }

        /* Ticker */
        .ticker-track { display: flex; animation: ticker 28s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }

        @media (max-width: 768px) {
          .hero-section { padding: 56px 20px 40px !important; }
          .hero-title   { font-size: 40px !important; letter-spacing: -1.5px !important; }
          .hero-sub     { font-size: 14px !important; }
          .section-pad  { padding: 40px 20px !important; }
          .cat-grid     { grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)) !important; }
          .stats-row    { gap: 20px !important; flex-wrap: wrap !important; }
          .alert-grid   { grid-template-columns: 1fr !important; }
          .divider-m    { margin: 0 20px !important; }
        }
        @media (max-width: 480px) {
          .hero-title { font-size: 32px !important; }
          .cat-grid   { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      {/* ── LIVE TICKER ── */}
      <div style={{
        background: '#c8f05a', overflow: 'hidden',
        padding: '8px 0', borderBottom: '0.5px solid rgba(0,0,0,0.1)',
      }}>
        <div className="ticker-track" style={{ whiteSpace: 'nowrap' }}>
          {[...Array(2)].map((_, ri) => (
            <span key={ri} style={{ display: 'inline-flex', alignItems: 'center', gap: '0' }}>
              {[
                '📱 iPhone 15 — ₹67,999 on Flipkart',
                '💻 MacBook Air M3 — ₹1,14,900 on Amazon',
                '🎧 Sony XM5 — ₹24,990 on Amazon',
                '👟 Nike Air Max — ₹8,495 on Myntra',
                '⌚ Apple Watch S9 — ₹41,900 on Amazon',
                '📷 Canon R50 — ₹64,995 on Flipkart',
                '🛒 Prices updated live · Compare & Save',
              ].map((item, i) => (
                <span key={i} style={{
                  fontSize: '12px', fontWeight: 600, color: '#080808',
                  fontFamily: 'DM Sans, sans-serif', padding: '0 32px',
                }}>
                  {item} &nbsp;·
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="hero-section noise" style={{
        position: 'relative', padding: '90px 48px 70px',
        maxWidth: '1200px', margin: '0 auto', overflow: 'hidden',
      }}>

        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-120px', right: '-80px',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,240,90,0.07) 0%, transparent 65%)',
          pointerEvents: 'none', animation: 'float 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-100px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,240,90,0.04) 0%, transparent 65%)',
          pointerEvents: 'none', animation: 'float 10s ease-in-out infinite reverse',
        }} />

        {/* Eyebrow */}
        <div className="hero-animate-1" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(200,240,90,0.07)',
          border: '0.5px solid rgba(200,240,90,0.25)',
          borderRadius: '100px', padding: '6px 16px',
          fontSize: '12px', color: '#c8f05a', fontWeight: 500,
          marginBottom: '28px', fontFamily: 'DM Sans, sans-serif',
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#c8f05a', animation: 'pulse 2s infinite',
          }} />
          AI-powered price comparison · India's smartest shopping tool
        </div>

        {/* Title */}
        <h1 className="hero-animate-2 hero-title" style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 'clamp(44px, 6.5vw, 80px)',
          fontWeight: 800, lineHeight: 0.95,
          letterSpacing: '-2.5px', marginBottom: '22px',
          color: '#f0ede8',
        }}>
          Find the <span style={{
            color: '#c8f05a',
            textShadow: '0 0 60px rgba(200,240,90,0.25)',
          }}>cheapest</span><br />
          price. Instantly.
        </h1>

        {/* Subtitle */}
        <p className="hero-animate-3 hero-sub" style={{
          fontSize: '16px', color: '#888580',
          maxWidth: '460px', lineHeight: 1.75,
          marginBottom: '36px', fontWeight: 300,
          fontFamily: 'DM Sans, sans-serif',
        }}>
          Paste any product URL from Amazon, Flipkart, or Myntra — Prixo instantly compares prices across all three and tells you exactly where to buy.
        </p>

        {/* Search Box */}
        <div className="hero-animate-4" style={{ maxWidth: '580px', marginBottom: '36px' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            {[
              { key: 'url', label: '🔗 Paste URL' },
              { key: 'search', label: '🔍 Search' },
            ].map(t => (
              <button key={t.key} className="tab-btn" onClick={() => setTab(t.key)} style={{
                padding: '6px 18px', borderRadius: '100px',
                fontSize: '12px', fontWeight: tab === t.key ? 700 : 400,
                border: tab === t.key ? 'none' : '0.5px solid rgba(255,255,255,0.1)',
                background: tab === t.key ? '#c8f05a' : 'transparent',
                color: tab === t.key ? '#080808' : '#888580',
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
              }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="search-wrap" style={{
            background: '#111', border: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: '18px', padding: '6px 6px 6px 20px',
            display: 'flex', alignItems: 'center', gap: '10px',
            transition: 'all 0.25s ease',
          }}>
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
              <circle cx="9" cy="9" r="6.5" stroke="#f0ede8" strokeWidth="1.5" />
              <path d="M14 14l4 4" stroke="#f0ede8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={handleKey}
              placeholder={tab === 'url' ? 'Paste Amazon, Flipkart or Myntra URL here…' : 'Type product name — e.g. boAt earphones, Nike shoes…'}
              style={{
                flex: 1, background: 'transparent', border: 'none',
                outline: 'none', color: '#f0ede8',
                fontSize: '14px', fontFamily: 'DM Sans, sans-serif', minWidth: 0,
              }}
            />
            <button className="btn-analyze" onClick={handleAnalyze} disabled={loading} style={{
              padding: '11px 24px', border: 'none', borderRadius: '12px',
              background: '#c8f05a', color: '#080808',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Syne, sans-serif', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {loading ? '⏳ Analyzing…' : 'Analyze →'}
            </button>
          </div>

          {loading && (
            <p style={{ marginTop: '10px', fontSize: '12px', color: '#c8f05a', fontFamily: 'DM Sans, sans-serif' }}>
              Fetching prices from Amazon, Flipkart & Myntra…
            </p>
          )}

          {/* Platform badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#555250', fontFamily: 'DM Sans, sans-serif' }}>Works with:</span>
            {[
              { label: '🛒 Amazon', color: '#FF9900' },
              { label: '📦 Flipkart', color: '#2874F0' },
              { label: '👗 Myntra', color: '#FF3F6C' },
            ].map(s => (
              <span key={s.label} style={{
                fontSize: '11px', fontWeight: 600,
                padding: '3px 12px', borderRadius: '100px',
                border: `0.5px solid ${s.color}44`,
                color: s.color, background: `${s.color}0f`,
                fontFamily: 'DM Sans, sans-serif',
              }}>
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Stats — realistic for a student project */}
        <div className="hero-animate-5 stats-row" style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          {[
            { num: '3', label: 'Stores compared instantly', icon: '🛍️' },
            { num: '₹500+', label: 'Avg savings per search', icon: '💰' },
            { num: 'AI', label: 'Powered smart verdict', icon: '🤖' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: 'rgba(200,240,90,0.08)',
                border: '0.5px solid rgba(200,240,90,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px',
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{
                  fontFamily: 'Syne, sans-serif', fontSize: '20px',
                  fontWeight: 800, color: '#c8f05a', letterSpacing: '-0.5px',
                }}>
                  {s.num}
                </div>
                <div style={{ fontSize: '11px', color: '#555250', fontFamily: 'DM Sans, sans-serif' }}>
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="divider-m" style={{ height: '0.5px', background: 'rgba(255,255,255,0.06)', margin: '0 48px' }} />

      {/* ── HOW IT WORKS ── */}
      <section className="section-pad" style={{ padding: '64px 48px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 500, color: '#c8f05a', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', fontFamily: 'DM Sans, sans-serif' }}>
          How it works
        </div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '32px' }}>
          3 steps to save money
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {[
            { step: '01', icon: '🔗', title: 'Paste any URL', desc: 'Copy product link from Amazon, Flipkart or Myntra and paste it here' },
            { step: '02', icon: '⚡', title: 'Instant comparison', desc: 'Prixo fetches live prices from all 3 platforms simultaneously' },
            { step: '03', icon: '🤖', title: 'AI verdict', desc: 'Get an AI score, Buy/Wait recommendation and best store to buy from' },
          ].map(s => (
            <div key={s.step} style={{
              background: '#111',
              border: '0.5px solid rgba(255,255,255,0.06)',
              borderRadius: '18px', padding: '24px 22px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: '16px', right: '16px',
                fontFamily: 'Syne, sans-serif', fontSize: '42px', fontWeight: 800,
                color: 'rgba(200,240,90,0.06)', lineHeight: 1,
              }}>
                {s.step}
              </div>
              <div style={{ fontSize: '28px', marginBottom: '14px' }}>{s.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>
                {s.title}
              </div>
              <div style={{ fontSize: '13px', color: '#888580', lineHeight: 1.6, fontFamily: 'DM Sans, sans-serif' }}>
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider-m" style={{ height: '0.5px', background: 'rgba(255,255,255,0.06)', margin: '0 48px' }} />

      {/* ── CATEGORIES ── */}
      <section className="section-pad" style={{ padding: '64px 48px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 500, color: '#c8f05a', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', fontFamily: 'DM Sans, sans-serif' }}>
          Browse by category
        </div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '28px' }}>
          What are you shopping for?
        </h2>

        <div className="cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))', gap: '10px' }}>
          {CATEGORIES.map(cat => (
            <div key={cat.name} className="cat-card" onClick={() => navigate(`/category/${cat.slug}`)} style={{
              background: '#111', border: '0.5px solid rgba(255,255,255,0.06)',
              borderRadius: '16px', padding: '20px 14px',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{cat.emoji}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>{cat.name}</div>
              <div style={{ fontSize: '11px', color: '#555250', fontFamily: 'DM Sans, sans-serif' }}>{cat.count} compared</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider-m" style={{ height: '0.5px', background: 'rgba(255,255,255,0.06)', margin: '0 48px' }} />

      {/* ── TRENDING ── */}
      <section className="section-pad" style={{ padding: '64px 48px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 500, color: '#c8f05a', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', fontFamily: 'DM Sans, sans-serif' }}>
          Trending now
        </div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '28px' }}>
          Most compared this week 🔥
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {TRENDING.map(p => (
            <div key={p.rank} className="trend-row" style={{
              background: '#111', border: '0.5px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '12px', fontWeight: 800, color: 'rgba(200,240,90,0.3)', width: '22px', flexShrink: 0 }}>
                {p.rank}
              </div>
              <div style={{
                width: '42px', height: '42px', borderRadius: '10px',
                background: '#1a1a1a', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '20px', flexShrink: 0,
              }}>
                {p.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 600, marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: '12px', color: '#555250', fontFamily: 'DM Sans, sans-serif' }}>{p.meta}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, marginBottom: '3px' }}>{p.price}</div>
                  <div style={{ fontSize: '11px', color: STORE_COLORS[p.store], fontFamily: 'DM Sans, sans-serif' }}>on {p.store}</div>
                </div>
                <ScoreDot score={p.score} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider-m" style={{ height: '0.5px', background: 'rgba(255,255,255,0.06)', margin: '0 48px' }} />

      {/* ── 🔔 PRICE DROP ALERT ── */}
      <section className="section-pad" style={{ padding: '64px 48px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, #111 0%, #151a0a 100%)',
          border: '0.5px solid rgba(255,180,50,0.2)',
          borderRadius: '24px', padding: '48px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Glow */}
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '300px', height: '300px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,180,50,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(255,180,50,0.12)',
              border: '0.5px solid rgba(255,180,50,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', animation: 'float 3s ease-in-out infinite',
            }}>
              🔔
            </div>
            <div style={{ fontSize: '11px', color: '#ffb432', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>
              Price Drop Alert
            </div>
          </div>

          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '10px' }}>
            Never miss a deal again
          </h2>
          <p style={{ fontSize: '14px', color: '#888580', marginBottom: '32px', maxWidth: '480px', lineHeight: 1.6, fontFamily: 'DM Sans, sans-serif' }}>
            Set your target price for any product. We'll send you an email the moment the price drops — on any of the 3 stores.
          </p>

          {alertSet ? (
            <div style={{
              background: 'rgba(200,240,90,0.08)',
              border: '0.5px solid rgba(200,240,90,0.25)',
              borderRadius: '14px', padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <span style={{ fontSize: '24px' }}>✅</span>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#c8f05a', marginBottom: '3px' }}>
                  Alert Set Successfully!
                </div>
                <div style={{ fontSize: '13px', color: '#888580', fontFamily: 'DM Sans, sans-serif' }}>
                  We'll notify you at <strong style={{ color: '#f0ede8' }}>{alertEmail}</strong> when the price drops.
                </div>
              </div>
            </div>
          ) : (
            <div className="alert-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
              {[
                { label: 'Your Email', placeholder: 'you@email.com', val: alertEmail, set: setAlertEmail, type: 'email', icon: '📧' },
                { label: 'Product Name', placeholder: 'e.g. Sony WH-1000XM5', val: alertProduct, set: setAlertProduct, type: 'text', icon: '🛍️' },
                { label: 'Target Price (₹)', placeholder: 'e.g. 20000', val: alertPrice, set: setAlertPrice, type: 'number', icon: '💰' },
              ].map((field, i) => (
                <div key={i}>
                  <div style={{ fontSize: '11px', color: '#888580', marginBottom: '7px', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {field.icon} {field.label}
                  </div>
                  <input
                    className="alert-input"
                    type={field.type}
                    value={field.val}
                    onChange={e => field.set(e.target.value)}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%', background: '#0e0e0e',
                      border: '0.5px solid rgba(255,180,50,0.2)',
                      borderRadius: '12px', padding: '11px 14px',
                      color: '#f0ede8', fontSize: '13px',
                      fontFamily: 'DM Sans, sans-serif',
                      transition: 'all 0.2s',
                    }}
                  />
                </div>
              ))}
              <button onClick={handleSetAlert} style={{
                padding: '11px 22px', border: 'none',
                borderRadius: '12px', background: '#ffb432',
                color: '#080808', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Syne, sans-serif',
                whiteSpace: 'nowrap', transition: 'all 0.2s',
                height: '42px',
              }}>
                🔔 Set Alert
              </button>
            </div>
          )}

          <p style={{ fontSize: '11px', color: '#555250', marginTop: '16px', fontFamily: 'DM Sans, sans-serif' }}>
            🔒 We only use your email for price alerts. No spam, ever.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '0 48px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          background: '#c8f05a',
          borderRadius: '24px', padding: '52px 48px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap',
        }}>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 800, letterSpacing: '-1px', color: '#080808', lineHeight: 1.1, marginBottom: '8px' }}>
              Let deals come to you.
            </h2>
            <p style={{ fontSize: '14px', color: '#2a2a2a', fontFamily: 'DM Sans, sans-serif' }}>
              We find. You save. Start comparing in seconds — it's free.
            </p>
          </div>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{
            padding: '14px 32px', border: '2px solid #080808',
            borderRadius: '100px', background: '#080808',
            color: '#c8f05a', fontSize: '15px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Syne, sans-serif',
            transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            Analyze a product →
          </button>
        </div>
      </section>
    </div>
  )
}