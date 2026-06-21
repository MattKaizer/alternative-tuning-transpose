import { DADGAD_OPEN_LABELS } from '@dadgad/core'
import { theme as T } from './theme'

interface DiagramProps {
  frets: (number | null)[]
}

const W = 132
const H = 168
const PAD_L = 16
const PAD_R = 16
const PAD_T = 30
const PAD_B = 22
const COLS = 6
const ROWS = 4
const GX = (W - PAD_L - PAD_R) / (COLS - 1)
const GY = (H - PAD_T - PAD_B) / ROWS

const sx = (i: number) => PAD_L + i * GX
const fy = (row: number) => PAD_T + row * GY

export default function Diagram({ frets }: DiagramProps) {
  const fretted = frets.filter((f): f is number => f != null && f > 0)
  const minF = fretted.length ? Math.min(...fretted) : 0
  const baseFret = minF > 2 ? minF - 1 : 0

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <rect
        x={PAD_L - 8}
        y={PAD_T - 2}
        width={W - PAD_L - PAD_R + 16}
        height={ROWS * GY + 4}
        rx="3"
        fill={T.rose}
        stroke={T.line}
        strokeWidth="1"
      />

      {baseFret === 0 ? (
        <rect
          x={PAD_L - 8}
          y={PAD_T - 4}
          width={W - PAD_L - PAD_R + 16}
          height="4"
          fill={T.bone}
          rx="1"
        />
      ) : (
        <text
          x={W - PAD_R + 6}
          y={PAD_T + GY * 0.62}
          fontSize="10"
          fill={T.brass}
          fontFamily="'DM Mono', ui-monospace, monospace"
          textAnchor="start"
        >
          {baseFret + 1}fr
        </text>
      )}

      {Array.from({ length: ROWS }).map((_, r) => (
        <line
          key={r}
          x1={PAD_L - 8}
          y1={fy(r + 1)}
          x2={W - PAD_R + 8}
          y2={fy(r + 1)}
          stroke={T.brassDim}
          strokeWidth="1.4"
          opacity="0.7"
        />
      ))}

      {Array.from({ length: COLS }).map((_, i) => (
        <line
          key={i}
          x1={sx(i)}
          y1={PAD_T}
          x2={sx(i)}
          y2={PAD_T + ROWS * GY}
          stroke={T.boneDim}
          strokeWidth={0.7 + i * 0.18}
          opacity="0.85"
        />
      ))}

      {frets.map((f, i) => {
        if (f === 0)
          return (
            <circle
              key={i}
              cx={sx(i)}
              cy={PAD_T - 12}
              r="4"
              fill="none"
              stroke={T.bone}
              strokeWidth="1.4"
            />
          )
        if (f == null)
          return (
            <g key={i} stroke={T.bad} strokeWidth="1.4">
              <line x1={sx(i) - 3.5} y1={PAD_T - 15.5} x2={sx(i) + 3.5} y2={PAD_T - 8.5} />
              <line x1={sx(i) - 3.5} y1={PAD_T - 8.5} x2={sx(i) + 3.5} y2={PAD_T - 15.5} />
            </g>
          )
        return null
      })}

      {frets.map((f, i) => {
        if (f == null || f === 0) return null
        const row = f - baseFret
        return (
          <g key={i}>
            <circle
              cx={sx(i)}
              cy={fy(row) - GY / 2}
              r="6.5"
              fill={T.bone}
              stroke={T.ink}
              strokeWidth="0.5"
            />
            <text
              x={sx(i)}
              y={fy(row) - GY / 2 + 3.2}
              fontSize="8"
              fill={T.ink}
              textAnchor="middle"
              fontFamily="'DM Mono', ui-monospace, monospace"
            >
              {f}
            </text>
          </g>
        )
      })}

      {DADGAD_OPEN_LABELS.map((l, i) => (
        <text
          key={i}
          x={sx(i)}
          y={H - 7}
          fontSize="9.5"
          fill={T.muted}
          textAnchor="middle"
          fontFamily="'DM Mono', ui-monospace, monospace"
        >
          {l}
        </text>
      ))}
    </svg>
  )
}
