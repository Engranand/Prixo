export default function ScoreBar({ label, value }) {
  const color = value >= 80 ? '#c8f05a' : value >= 60 ? '#ffb432' : '#ff5a5a'

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', color: '#888580' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: 500, color, fontFamily: 'Syne, sans-serif' }}>{value}</span>
      </div>
      <div style={{ height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${value}%`,
          background: color, borderRadius: '3px',
          transition: 'width 1s ease',
        }} />
      </div>
    </div>
  )
}
