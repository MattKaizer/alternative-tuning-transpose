import { PITCH_CLASSES, type ParsedChord, type Voicing } from '@dadgad/core'
import { theme as T } from '../theme'
import Diagram from './Diagram'

interface ChordCardProps {
  chord: ParsedChord
  voicings: Voicing[]
}

export default function ChordCard({ chord, voicings }: ChordCardProps) {
  return (
    <div className="rounded-lg p-3" style={{ background: T.woodHi, border: `1px solid ${T.line}` }}>
      <div className="flex items-baseline justify-between mb-2">
        <span
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 22,
            color: T.bone,
            fontWeight: 600,
          }}
        >
          {chord.display}
        </span>
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: T.muted,
          }}
        >
          {[...new Set(chord.pitchClasses)].map((p) => PITCH_CLASSES[p]).join(' ')}
        </span>
      </div>

      {voicings.length === 0 ? (
        <p style={{ color: T.muted, fontSize: 12 }}>
          No clean voicing found in this fret window.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {voicings.map((v, k) => (
            <div
              key={k}
              className="rounded p-1"
              style={{ background: T.wood }}
            >
              <Diagram frets={v.frets} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
