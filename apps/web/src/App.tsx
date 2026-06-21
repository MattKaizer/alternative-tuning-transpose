import { useMemo, useState } from 'react'
import {
  DADGAD_OPEN_LABELS,
  parseChord,
  parseChordSequence,
  findVoicings,
} from '@dadgad/core'
import { theme as T } from './theme'
import ChordCard from './components/ChordCard'

const PRESETS: Record<string, string> = {
  'Modal folk (D)': 'D Dsus4 G Em7 Cadd9 Asus4',
  'Celtic Am': 'Am C G D F',
  'Singer-songwriter': 'G D Em C',
  'Bluesy in A': 'A7 D7 E7',
}

export default function App() {
  const [input, setInput] = useState('D Dsus4 G Em7 Cadd9 Asus4')
  const [maxFret, setMaxFret] = useState(12)
  const [shapes, setShapes] = useState(4)

  const tokens = useMemo(() => parseChordSequence(input), [input])

  const results = useMemo(
    () =>
      tokens.map((tok) => {
        const ch = parseChord(tok)
        return { tok, ch, voicings: ch ? findVoicings(ch, { maxFret, limit: shapes }) : [] }
      }),
    [tokens, maxFret, shapes],
  )

  const unknown = results.filter((r) => !r.ch).map((r) => r.tok)

  return (
    <div style={{ background: T.ink, minHeight: '100vh', color: T.bone }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input, textarea, button { font-family: inherit; }
        .fld:focus { outline: 2px solid ${T.brass}; outline-offset: 1px; }
      `}</style>

      <div style={{ maxWidth: 920, margin: '0 auto', padding: '28px 18px 60px' }}>
        <header className="mb-6">
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: 3,
              color: T.brass,
              textTransform: 'uppercase',
            }}
          >
            Open tuning &middot; low &rarr; high
          </div>
          <div className="flex items-center gap-3 mt-1 mb-3">
            {DADGAD_OPEN_LABELS.map((l, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  style={{
                    width: 1.4 + i * 0.5,
                    height: 26,
                    background: T.brass,
                    opacity: 0.85,
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: 18,
                    color: T.bone,
                    marginTop: 4,
                  }}
                >
                  {l}
                </span>
              </div>
            ))}
            <h1
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 40,
                fontWeight: 700,
                marginLeft: 14,
                lineHeight: 1,
              }}
            >
              DADGAD<span style={{ color: T.brass }}>.</span>
            </h1>
          </div>
          <p style={{ color: T.boneDim, fontSize: 14, maxWidth: 560 }}>
            Type a song&apos;s chords from standard tuning. The names don&apos;t change &mdash;
            but the shapes do. Here are the most open, drone-friendly ways to play each one in
            DADGAD.
          </p>
        </header>

        <div
          className="rounded-lg p-3 mb-4"
          style={{ background: T.wood, border: `1px solid ${T.line}` }}
        >
          <label
            style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.muted }}
          >
            Chords
          </label>
          <textarea
            className="fld w-full mt-1 rounded p-2"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            style={{
              background: T.ink,
              color: T.bone,
              border: `1px solid ${T.line}`,
              resize: 'vertical',
              fontSize: 16,
            }}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(PRESETS).map(([name, val]) => (
              <button
                key={name}
                onClick={() => setInput(val)}
                className="rounded px-2 py-1"
                style={{
                  background: T.woodHi,
                  border: `1px solid ${T.line}`,
                  color: T.boneDim,
                  fontSize: 12,
                }}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-6 mt-3">
            <label
              className="flex items-center gap-2"
              style={{ fontSize: 12, color: T.boneDim }}
            >
              Shapes each
              <input
                type="range"
                min={1}
                max={4}
                value={shapes}
                onChange={(e) => setShapes(+e.target.value)}
                style={{ accentColor: T.brass }}
              />
              <span style={{ fontFamily: "'DM Mono', monospace", color: T.brass }}>
                {shapes}
              </span>
            </label>
            <label
              className="flex items-center gap-2"
              style={{ fontSize: 12, color: T.boneDim }}
            >
              Reach to fret
              <input
                type="range"
                min={5}
                max={15}
                value={maxFret}
                onChange={(e) => setMaxFret(+e.target.value)}
                style={{ accentColor: T.brass }}
              />
              <span style={{ fontFamily: "'DM Mono', monospace", color: T.brass }}>
                {maxFret}
              </span>
            </label>
          </div>

          {unknown.length > 0 && (
            <p className="mt-2" style={{ color: T.bad, fontSize: 12 }}>
              Couldn&apos;t read: {unknown.join(', ')} &mdash; try forms like G, Em7, Cadd9,
              Dsus4, A7, F#m, G/B.
            </p>
          )}
        </div>

        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
        >
          {results
            .filter((r) => r.ch)
            .map((r, i) => (
              <ChordCard key={i} chord={r.ch} voicings={r.voicings} />
            ))}
        </div>

        <div
          className="mt-6 rounded-lg p-3"
          style={{ background: T.wood, border: `1px solid ${T.line}` }}
        >
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: T.brass,
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Reading the boxes
          </div>
          <p style={{ color: T.boneDim, fontSize: 13, lineHeight: 1.5 }}>
            Strings run left &rarr; right as{' '}
            <b style={{ color: T.bone }}>D A D G A D</b> (low to high). A ring above the nut
            means play that string open; an <span style={{ color: T.bad }}>&#10005;</span>{' '}
            means don&apos;t play it. Numbers in the bone dots are fret numbers. Voicings that
            keep the open D and A strings ringing are ranked first &mdash; that drone is the
            whole point of DADGAD, so lean into it rather than fighting for textbook shapes.
          </p>
        </div>
      </div>
    </div>
  )
}
