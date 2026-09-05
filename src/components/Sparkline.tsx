type SparklineProps = { points: readonly number[]; direction: 'up' | 'down' }

export function Sparkline({ points, direction }: SparklineProps) {
  const high = Math.max(...points)
  const low = Math.min(...points)
  const range = Math.max(1, high - low)
  const coordinates = points.map((point, index) => {
    const x = (index / (points.length - 1)) * 120
    const y = 32 - ((point - low) / range) * 27
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  return <svg className={`sparkline sparkline--${direction}`} viewBox="0 0 120 36" role="img" aria-label={`Trend ${direction === 'up' ? 'in crescita' : 'in calo'}`}><polyline points={coordinates} /></svg>
}
