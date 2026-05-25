// src/components/MassTrendChart.tsx
// Lightweight SVG weight trend chart — no external chart library.

type Point = { date: string; weight: number }

type Props = {
  points: Point[]
}

const WIDTH = 320
const HEIGHT = 120
const PAD = { top: 8, right: 8, bottom: 20, left: 36 }

function formatShortDate(date: string): string {
  const [, month, day] = date.split('-')
  return `${Number(month)}/${Number(day)}`
}

export function MassTrendChart({ points }: Props) {
  if (points.length === 0) {
    return (
      <div className="flex h-[120px] items-center justify-center text-xs text-[var(--mos-text-muted)]">
        Log a few weigh-ins to see your trend
      </div>
    )
  }

  const weights = points.map((p) => p.weight)
  const minW = Math.min(...weights)
  const maxW = Math.max(...weights)
  const range = maxW - minW || 1
  const yMin = minW - range * 0.15
  const yMax = maxW + range * 0.15
  const ySpan = yMax - yMin || 1

  const innerW = WIDTH - PAD.left - PAD.right
  const innerH = HEIGHT - PAD.top - PAD.bottom

  const coords = points.map((p, i) => {
    const x =
      points.length === 1
        ? PAD.left + innerW / 2
        : PAD.left + (i / (points.length - 1)) * innerW
    const y = PAD.top + innerH - ((p.weight - yMin) / ySpan) * innerH
    return { x, y, ...p }
  })

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')

  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(PAD.top + innerH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(PAD.top + innerH).toFixed(1)} Z`
      : ''

  const yTicks = [yMin, yMin + ySpan / 2, yMax]

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full h-auto"
      role="img"
      aria-label="Weight trend over the past month"
    >
      {yTicks.map((w) => {
        const y = PAD.top + innerH - ((w - yMin) / ySpan) * innerH
        return (
          <g key={w}>
            <line
              x1={PAD.left}
              y1={y}
              x2={WIDTH - PAD.right}
              y2={y}
              stroke="var(--mos-border-muted)"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 4}
              y={y + 3}
              textAnchor="end"
              fill="var(--mos-text-muted)"
              fontSize="9"
            >
              {w.toFixed(0)}
            </text>
          </g>
        )
      })}

      {areaPath && (
        <path d={areaPath} fill="var(--mos-income-bg)" stroke="none" />
      )}

      {coords.length > 1 && (
        <path
          d={linePath}
          fill="none"
          stroke="var(--mos-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {coords.map((c) => (
        <circle
          key={c.date}
          cx={c.x}
          cy={c.y}
          r={coords.length === 1 ? 4 : 3}
          fill="var(--mos-accent)"
        />
      ))}

      {coords.length > 0 && (
        <>
          <text
            x={coords[0].x}
            y={HEIGHT - 4}
            textAnchor="middle"
            fill="var(--mos-text-muted)"
            fontSize="9"
          >
            {formatShortDate(coords[0].date)}
          </text>
          {coords.length > 1 && (
            <text
              x={coords[coords.length - 1].x}
              y={HEIGHT - 4}
              textAnchor="middle"
              fill="var(--mos-text-muted)"
              fontSize="9"
            >
              {formatShortDate(coords[coords.length - 1].date)}
            </text>
          )}
        </>
      )}
    </svg>
  )
}
