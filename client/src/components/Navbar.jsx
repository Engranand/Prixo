import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const isGrocery = location.pathname.startsWith('/grocery')

  return (
    <>
      <style>{`
        .nav-link:hover { color: #f0ede8 !important; }
        .dash-btn { transition: all 0.2s; cursor: pointer; }
        .dash-btn:hover { opacity: 0.85; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: transparent; border: none; padding: 4px; }
        .hamburger span { display: block; width: 22px; height: 1.5px; background: #888580; border-radius: 2px; transition: all 0.2s; }
        .mobile-menu { display: none; }

        @media (max-width: 768px) {
          .nav-center { display: none !important; }
          .nav-right-links { display: none !important; }
          .nav-try-btn { display: none !important; }
          .hamburger { display: flex !important; }
          .mobile-menu { display: flex !important; }
          .nav-wrap { padding: 12px 20px !important; }
        }
      `}</style>

      <nav className="nav-wrap" style={{
        position: 'sticky', top: 0, zIndex: 100,
        padding: '12px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(8,8,8,0.92)',
        backdropFilter: 'blur(24px)',
        borderBottom: '0.5px solid rgba(255,255,255,0.07)',
      }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, color: '#f0ede8', letterSpacing: '-0.5px', lineHeight: 1 }}>
              Prix<span style={{ color: '#c8f05a' }}>o</span>
            </div>
            <div style={{ fontSize: '9px', color: '#555250', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.5px', marginTop: '2px', whiteSpace: 'nowrap' }}>
              We Find. You Save.
            </div>
          </div>
        </Link>

        {/* Dashboard Switcher — CENTER (desktop) */}
        <div className="nav-center" style={{
          display: 'flex', alignItems: 'center',
          background: '#161616',
          border: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: '100px', padding: '4px', gap: '2px',
        }}>
          {[
            { label: '🛍️ Shopping', path: '/', active: !isGrocery },
            { label: '🛒 Grocery', path: '/grocery', active: isGrocery },
          ].map(({ label, path, active }) => (
            <button key={path} className="dash-btn" onClick={() => navigate(path)} style={{
              padding: '7px 18px', borderRadius: '100px', border: 'none',
              background: active ? '#c8f05a' : 'transparent',
              color: active ? '#080808' : '#888580',
              fontSize: '13px', fontWeight: active ? 700 : 400,
              fontFamily: active ? 'Syne, sans-serif' : 'DM Sans, sans-serif',
              whiteSpace: 'nowrap',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Right — desktop */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link to="/history" className="nav-right-links nav-link" style={{
            color: location.pathname === '/history' ? '#f0ede8' : '#888580',
            fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s',
          }}>
            History
          </Link>
          <Link to="/compare" className="nav-right-links nav-link" style={{
            color: location.pathname === '/compare' ? '#c8f05a' : '#888580',
            fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            ⚖️ Compare
          </Link>
          <Link to="/" className="nav-try-btn">
            <button style={{
              padding: '8px 20px', border: 'none', borderRadius: '100px',
              background: '#c8f05a', color: '#080808',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Syne, sans-serif',
            }}>
              Try Prixo
            </button>
          </Link>

          {/* Hamburger — mobile */}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span style={{ transform: menuOpen ? 'rotate(45deg) translateY(6px)' : 'none' }} />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span style={{ transform: menuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="mobile-menu" style={{
          position: 'fixed', top: '57px', left: 0, right: 0, zIndex: 99,
          background: 'rgba(8,8,8,0.98)',
          backdropFilter: 'blur(24px)',
          borderBottom: '0.5px solid rgba(255,255,255,0.07)',
          flexDirection: 'column', padding: '16px 20px 24px',
          gap: '4px',
        }}>
          {/* Dashboard toggle */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {[
              { label: '🛍️ Shopping', path: '/', active: !isGrocery },
              { label: '🛒 Grocery', path: '/grocery', active: isGrocery },
            ].map(({ label, path, active }) => (
              <button key={path} onClick={() => { navigate(path); setMenuOpen(false) }} style={{
                flex: 1, padding: '10px', borderRadius: '12px', border: 'none',
                background: active ? '#c8f05a' : '#161616',
                color: active ? '#080808' : '#888580',
                fontSize: '13px', fontWeight: active ? 700 : 400,
                fontFamily: 'Syne, sans-serif', cursor: 'pointer',
              }}>
                {label}
              </button>
            ))}
          </div>

          {[
            { label: '📜 History', path: '/history' },
            { label: '⚖️ Compare', path: '/compare' },
          ].map(({ label, path }) => (
            <Link key={path} to={path} onClick={() => setMenuOpen(false)} style={{
              padding: '12px 16px', borderRadius: '12px',
              color: '#888580', fontSize: '14px', textDecoration: 'none',
              display: 'block', background: '#161616',
            }}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}