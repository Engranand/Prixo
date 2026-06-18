export default function ScoreBadge({ score, size = 'sm' }) {
  const color = score >= 80 ? '#c8f05a' : score >= 60 ? '#ffb432' : '#ff5a5a'
  const bg = score >= 80
    ? 'rgba(200,240,90,0.12)'
    : score >= 60
    ? 'rgba(255,180,50,0.12)'
    : 'rgba(255,90,90,0.12)'
  const border = score >= 80
    ? 'rgba(200,240,90,0.25)'
    : score >= 60
    ? 'rgba(255,180,50,0.25)'
    : 'rgba(255,90,90,0.25)'

  const isLg = size === 'lg'

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: bg,
      border: `0.5px solid ${border}`,
      borderRadius: '100px',
      padding: isLg ? '6px 16px' : '3px 10px',
    }}>
      <span style={{
        color,
        fontFamily: 'Syne, sans-serif',
        fontWeight: 700,
        fontSize: isLg ? '20px' : '12px',
      }}>
        {score}
      </span>
      {isLg && (
        <span style={{ color, fontSize: '13px' }}>/100</span>
      )}
    </div>
  )
}
