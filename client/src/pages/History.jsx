import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import ScoreBadge from '../components/ScoreBadge'

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get('/api/history')
      setHistory(data.data || [])
    } catch {
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (id, e) => {
    e.stopPropagation()
    try {
      await axios.delete(`/api/history/${id}`)
      setHistory(prev => prev.filter(h => h._id !== id))
      toast.success('Removed from history')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const totalSaved = history.reduce((sum, h) => sum + (h.lowestPrice || 0), 0)

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 40px 80px' }}>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .hist-row:hover { border-color: rgba(255,255,255,0.12) !important; background: #1e1e1e !important; }
        .del-btn:hover { background: rgba(255,90,90,0.15) !important; color: #ff5a5a !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px', animation: 'fadeUp 0.4s ease both' }}>
        <div style={{ fontSize: '11px', fontWeight: 500, color: '#c8f05a', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
          Your research
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-1px' }}>
          Search History
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px', animation: 'fadeUp 0.4s 0.05s ease both' }}>
        {[
          { label: 'Products researched', value: history.length },
          { label: 'Avg AI score', value: history.length ? Math.round(history.reduce((s, h) => s + (h.aiScore || 0), 0) / history.length) : 0 },
          { label: 'Total value tracked', value: `₹${totalSaved.toLocaleString()}` },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)',
            borderRadius: '14px', padding: '18px',
          }}>
            <div style={{ fontSize: '12px', color: '#555250', marginBottom: '6px' }}>{stat.label}</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 700 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* History List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#555250' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          <div style={{ fontSize: '14px' }}>Loading history…</div>
        </div>
      ) : history.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 40px',
          background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)',
          borderRadius: '20px',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>No searches yet</h3>
          <p style={{ color: '#555250', fontSize: '14px', marginBottom: '24px' }}>Analyze your first product to see it here</p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 24px', border: 'none',
              borderRadius: '100px', background: '#c8f05a',
              color: '#080808', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Syne, sans-serif',
            }}
          >
            Analyze a product →
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {history.map((item, i) => (
            <div
              key={item._id}
              className="hist-row"
              onClick={() => navigate('/')}
              style={{
                background: '#161616', border: '0.5px solid rgba(255,255,255,0.07)',
                borderRadius: '14px', padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '16px',
                cursor: 'pointer', transition: 'all 0.2s',
                animation: `fadeUp 0.4s ${i * 0.05}s ease both`,
              }}
            >
              {/* Image */}
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '8px', background: '#1e1e1e', flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: '50px', height: '50px', background: '#1e1e1e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>📦</div>
              )}

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 600, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '12px', color: '#555250' }}>
                  {new Date(item.searchedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {item.lowestPrice ? ` · ₹${item.lowestPrice.toLocaleString()}` : ''}
                </div>
              </div>

              {/* Score */}
              {item.aiScore && <ScoreBadge score={item.aiScore} />}

              {/* Delete */}
              <button
                className="del-btn"
                onClick={(e) => deleteItem(item._id, e)}
                style={{
                  width: '30px', height: '30px',
                  borderRadius: '50%', border: '0.5px solid rgba(255,255,255,0.07)',
                  background: 'transparent', color: '#555250',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', flexShrink: 0, transition: 'all 0.2s',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
