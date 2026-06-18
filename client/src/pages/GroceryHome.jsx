import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const GROCERY_CATEGORIES = [
  { emoji: '🥛', name: 'Dairy & Eggs', slug: 'dairy eggs milk' },
  { emoji: '🍎', name: 'Fruits', slug: 'fresh fruits apples' },
  { emoji: '🥦', name: 'Vegetables', slug: 'fresh vegetables onion' },
  { emoji: '🍚', name: 'Rice & Atta', slug: 'basmati rice atta flour' },
  { emoji: '🛢️', name: 'Oils & Ghee', slug: 'cooking oil ghee' },
  { emoji: '🧴', name: 'Personal Care', slug: 'shampoo soap body wash' },
  { emoji: '🍫', name: 'Snacks', slug: 'chips biscuits snacks' },
  { emoji: '☕', name: 'Tea & Coffee', slug: 'tea coffee beverages' },
  { emoji: '🧹', name: 'Cleaning', slug: 'detergent floor cleaner' },
  { emoji: '🥩', name: 'Meat & Fish', slug: 'chicken mutton fish' },
  { emoji: '🧃', name: 'Beverages', slug: 'juice cold drink soda' },
  { emoji: '🥣', name: 'Breakfast', slug: 'cornflakes oats muesli' },
]

const TRENDING_GROCERY = [
  { emoji: '🥛', name: 'Amul Full Cream Milk 1L', zepto: '₹68', blinkit: '₹66', bigbasket: '₹70', cheapest: 'Blinkit' },
  { emoji: '🍅', name: 'Fresh Tomatoes 1kg', zepto: '₹35', blinkit: '₹38', bigbasket: '₹32', cheapest: 'BigBasket' },
  { emoji: '🛢️', name: 'Fortune Sunflower Oil 1L', zepto: '₹142', blinkit: '₹139', bigbasket: '₹145', cheapest: 'Blinkit' },
  { emoji: '🍚', name: 'India Gate Basmati Rice 1kg', zepto: '₹118', blinkit: '₹115', bigbasket: '₹122', cheapest: 'Blinkit' },
  { emoji: '🧴', name: 'Dove Soap Bar 100g', zepto: '₹48', blinkit: '₹45', bigbasket: '₹50', cheapest: 'Blinkit' },
]

const PLATFORM_COLORS = {
  Zepto:      { color: '#9B5DE5', bg: '#9B5DE512', border: '#9B5DE535' },
  Blinkit:    { color: '#F9C74F', bg: '#F9C74F12', border: '#F9C74F35' },
  BigBasket:  { color: '#4CAF50', bg: '#4CAF5012', border: '#4CAF5035' },
}

export default function GroceryHome() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSearch = () => {
    if (!query.trim()) return toast.error('Please enter a product name')
    navigate(`/grocery/search?q=${encodeURIComponent(query.trim())}`)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .g-hero-title { animation: fadeUp 0.5s 0.1s ease both; }
        .g-hero-sub { animation: fadeUp 0.5s 0.2s ease both; }
        .g-hero-search { animation: fadeUp 0.5s 0.3s ease both; }
        .g-cat-card:hover { border-color: rgba(155,93,229,0.3) !important; transform: translateY(-3px); background: rgba(155,93,229,0.04) !important; }
        .g-trend-row:hover { background: #1e1e1e !important; transform: translateX(4px); }
        .g-search-wrap:focus-within { border-color: rgba(155,93,229,0.5) !important; box-shadow: 0 0 0 3px rgba(155,93,229,0.08); }
        .g-btn:hover { background: #7a3fd4 !important; transform: translateY(-1px); }
        .g-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
        .g-cat-card { transition: all 0.25s; }
        .g-trend-row { transition: all 0.2s; }
      `}</style>

      {/* Hero */}
      <div style={{ position: 'relative', padding: '80px 40px 60px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Purple glow */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-80px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(155,93,229,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Eyebrow */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(155,93,229,0.08)',
          border: '0.5px solid rgba(155,93,229,0.25)',
          borderRadius: '100px', padding: '5px 14px',
          fontSize: '12px', color: '#9B5DE5', fontWeight: 500,
          marginBottom: '28px',
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#9B5DE5', animation: 'pulse 2s infinite',
          }} />
          Compare grocery prices in real-time
        </div>

        <h1 className="g-hero-title" style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 'clamp(40px, 6vw, 72px)',
          fontWeight: 800, lineHeight: 1.0,
          letterSpacing: '-2px', marginBottom: '20px',
        }}>
          Grocery <span style={{ color: '#9B5DE5', fontStyle: 'italic' }}>smarter.</span><br />
          Save every time.
        </h1>

        <p className="g-hero-sub" style={{
          fontSize: '17px', color: '#888580',
          maxWidth: '480px', lineHeight: 1.7,
          marginBottom: '36px', fontWeight: 300,
        }}>
          Search any grocery item — Prixo compares prices on Zepto, Blinkit & BigBasket including delivery charges so you always pay less.
        </p>

        {/* Search */}
        <div className="g-hero-search" style={{ maxWidth: '600px', marginBottom: '16px' }}>
          <div className="g-search-wrap" style={{
            background: '#161616',
            border: '0.5px solid rgba(255,255,255,0.12)',
            borderRadius: '28px', padding: '6px 6px 6px 20px',
            display: 'flex', alignItems: 'center', gap: '12px',
            transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>🔍</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Search grocery — milk, atta, oil, shampoo…"
              style={{
                flex: 1, background: 'transparent', border: 'none',
                outline: 'none', color: '#f0ede8',
                fontSize: '15px', fontFamily: 'DM Sans, sans-serif',
              }}
            />
            <button
              className="g-btn"
              onClick={handleSearch}
              disabled={loading}
              style={{
                padding: '11px 26px', border: 'none',
                borderRadius: '100px', background: '#9B5DE5',
                color: '#fff', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Syne, sans-serif',
                whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0,
              }}
            >
              Compare →
            </button>
          </div>

          {/* Platform badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <span style={{ fontSize: '11px', color: '#555250' }}>Live prices from:</span>
            {[
              { label: '⚡ Zepto', ...PLATFORM_COLORS.Zepto },
              { label: '🟡 Blinkit', ...PLATFORM_COLORS.Blinkit },
              { label: '🟢 BigBasket', ...PLATFORM_COLORS.BigBasket },
            ].map(s => (
              <span key={s.label} style={{
                fontSize: '11px', fontWeight: 600,
                padding: '3px 10px', borderRadius: '100px',
                border: `0.5px solid ${s.border}`,
                color: s.color, background: s.bg,
              }}>
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '40px', marginTop: '32px' }}>
          {[
            { num: '50+', label: 'Avg savings per order' },
            { num: '3', label: 'Platforms compared' },
            { num: '10min', label: 'Avg delivery time' },
          ].map(s => (
            <div key={s.label}>
              <div style={{
                fontFamily: 'Syne, sans-serif', fontSize: '24px',
                fontWeight: 700, letterSpacing: '-0.5px',
                color: '#f0ede8',
              }}>
                {s.num.includes('₹') ? '' : ''}
                <span style={{ color: '#9B5DE5' }}>{s.num}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#555250', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.07)', margin: '0 40px' }} />

      {/* Quick categories */}
      <section style={{ padding: '60px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 500, color: '#9B5DE5', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
          Browse by category
        </div>
        <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, letterSpacing: '-1px', marginBottom: '28px' }}>
          What do you need today?
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
          {GROCERY_CATEGORIES.map(cat => (
            <div
              key={cat.name}
              className="g-cat-card"
              onClick={() => navigate(`/grocery/search?q=${encodeURIComponent(cat.slug)}`)}
              style={{
                background: '#161616',
                border: '0.5px solid rgba(255,255,255,0.07)',
                borderRadius: '14px', padding: '18px 14px',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '26px', marginBottom: '8px' }}>{cat.emoji}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 600 }}>{cat.name}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.07)', margin: '0 40px' }} />

      {/* Trending comparisons */}
      <section style={{ padding: '60px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 500, color: '#9B5DE5', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
          Trending comparisons
        </div>
        <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, letterSpacing: '-1px', marginBottom: '28px' }}>
          Most compared this week 🔥
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {TRENDING_GROCERY.map((item, i) => (
            <div
              key={i}
              className="g-trend-row"
              onClick={() => navigate(`/grocery/search?q=${encodeURIComponent(item.name)}`)}
              style={{
                background: '#161616',
                border: '0.5px solid rgba(255,255,255,0.07)',
                borderRadius: '14px', padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '16px',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '26px', width: '40px', textAlign: 'center', flexShrink: 0 }}>{item.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                  {item.name}
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#888580' }}>
                  <span style={{ color: PLATFORM_COLORS.Zepto.color }}>⚡ {item.zepto}</span>
                  <span style={{ color: PLATFORM_COLORS.Blinkit.color }}>🟡 {item.blinkit}</span>
                  <span style={{ color: PLATFORM_COLORS.BigBasket.color }}>🟢 {item.bigbasket}</span>
                </div>
              </div>
              <div style={{
                background: 'rgba(155,93,229,0.1)',
                border: '0.5px solid rgba(155,93,229,0.25)',
                borderRadius: '8px', padding: '4px 12px',
                fontSize: '11px', color: '#9B5DE5', fontWeight: 600,
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                Cheapest: {item.cheapest}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}