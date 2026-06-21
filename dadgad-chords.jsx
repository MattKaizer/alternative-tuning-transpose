import React, { useMemo, useState } from "react";

/* ============================================================
   DADGAD VOICING ENGINE
   Same names, new shapes. Given a chord name, search the
   DADGAD fretboard (D A D G A D) for playable voicings that
   favor open-string drones and low positions.
   ============================================================ */

const STRINGS = [38, 45, 50, 55, 57, 62]; // D2 A2 D3 G3 A3 D4 (low -> high)
const OPEN_LABELS = ["D", "A", "D", "G", "A", "D"];
const PC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const N2P = {
  C: 0, "C#": 1, DB: 1, D: 2, "D#": 3, EB: 3, E: 4, FB: 4, F: 5, "E#": 5,
  "F#": 6, GB: 6, G: 7, "G#": 8, AB: 8, A: 9, "A#": 10, BB: 10, B: 11, CB: 11, "B#": 0,
};
const Q = {
  "": [0, 4, 7], maj: [0, 4, 7], M: [0, 4, 7],
  m: [0, 3, 7], min: [0, 3, 7], "-": [0, 3, 7],
  "5": [0, 7], sus2: [0, 2, 7], sus4: [0, 5, 7], sus: [0, 5, 7],
  "7": [0, 4, 7, 10], dom7: [0, 4, 7, 10], maj7: [0, 4, 7, 11], M7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10], min7: [0, 3, 7, 10],
  "6": [0, 4, 7, 9], m6: [0, 3, 7, 9],
  dim: [0, 3, 6], dim7: [0, 3, 6, 9], m7b5: [0, 3, 6, 10],
  aug: [0, 4, 8], "+": [0, 4, 8],
  add9: [0, 4, 7, 2], "9": [0, 4, 7, 10, 2], m9: [0, 3, 7, 10, 2],
  maj9: [0, 4, 7, 11, 2], "7sus4": [0, 5, 7, 10],
};

function parseChord(name) {
  let nm = String(name).trim();
  if (!nm) return null;
  let bass = null;
  const sl = nm.split("/");
  if (sl.length === 2) {
    nm = sl[0].trim();
    const bm = sl[1].trim().match(/^([A-Ga-g])([#b]?)$/);
    if (bm) bass = N2P[(bm[1].toUpperCase() + bm[2]).toUpperCase()];
  }
  const m = nm.match(/^([A-Ga-g])([#b]?)(.*)$/);
  if (!m) return null;
  const root = m[1].toUpperCase() + m[2];
  const rootPc = N2P[root.toUpperCase()];
  if (rootPc == null) return null;
  const q = m[3].trim();
  if (!(q in Q)) return null;
  const iv = Q[q];
  const pcs = [...new Set(iv.map((i) => (rootPc + i) % 12))];
  const essIv = iv.length <= 2 ? iv : iv.filter((i) => i !== 7);
  const ess = [...new Set(essIv.map((i) => (rootPc + i) % 12))];
  return { name, display: nm + (bass != null ? "/" + PC[bass] : ""), root, rootPc, q, iv, pcs, ess, bass };
}

function findVoicings(ch, maxFret = 12, limit = 4) {
  const opts = STRINGS.map((open) => {
    const a = [null];
    for (let f = 0; f <= maxFret; f++) if (ch.pcs.includes((open + f) % 12)) a.push(f);
    return a;
  });
  const out = [];
  const cur = new Array(6);
  function evaluate() {
    const sounding = [];
    for (let i = 0; i < 6; i++) if (cur[i] != null) sounding.push(i);
    if (sounding.length < 3) return;
    const spcs = new Set(sounding.map((i) => (STRINGS[i] + cur[i]) % 12));
    for (const e of ch.ess) if (!spcs.has(e)) return;
    const fretted = sounding.filter((i) => cur[i] > 0).map((i) => cur[i]);
    let span = 0;
    if (fretted.length) span = Math.max(...fretted) - Math.min(...fretted);
    if (span > 4) return;
    const lo = sounding[0], hi = sounding[sounding.length - 1];
    let interior = 0;
    for (let i = lo; i <= hi; i++) if (cur[i] == null) interior++;
    if (interior > 1) return;
    if (fretted.length > 4) return;
    const bassPc = (STRINGS[sounding[0]] + cur[sounding[0]]) % 12;
    if (ch.bass != null && !spcs.has(ch.bass)) return;
    let score = 0;
    const opens = sounding.filter((i) => cur[i] === 0).length;
    score += opens * 1.6;
    if (cur[0] === 0) score += 1.2;
    if (bassPc === ch.rootPc) score += 3;
    if (ch.bass != null && bassPc === ch.bass) score += 2.5;
    if (spcs.has((ch.rootPc + 7) % 12)) score += 1;
    score += sounding.length * 0.5;
    score -= interior * 2;
    score -= span * 0.5;
    score -= fretted.length * 0.3;
    const avg = fretted.length ? fretted.reduce((a, b) => a + b, 0) / fretted.length : 0;
    score -= avg * 0.45;
    out.push({ frets: [...cur], score });
  }
  (function rec(s) {
    if (s === 6) return evaluate();
    for (const o of opts[s]) {
      cur[s] = o;
      rec(s + 1);
    }
  })(0);
  out.sort((a, b) => b.score - a.score);
  const seen = new Set();
  const uniq = [];
  for (const v of out) {
    const k = v.frets.join(",");
    if (seen.has(k)) continue;
    seen.add(k);
    uniq.push(v);
  }
  return uniq.slice(0, limit).map((v) => ({
    frets: v.frets,
    notes: v.frets.map((f, i) => (f == null ? "x" : PC[(STRINGS[i] + f) % 12])),
  }));
}

/* ============================================================
   THEME — luthier's workbench: walnut, brass, bone
   ============================================================ */
const T = {
  ink: "#1b1410",
  wood: "#241a14",
  woodHi: "#2f231b",
  rose: "#3a2a20",
  brass: "#d6a23c",
  brassDim: "#9a7327",
  bone: "#ece3d1",
  boneDim: "#b7a98f",
  muted: "#94836d",
  line: "#4a382b",
  bad: "#c2664a",
};

/* ============================================================
   CHORD DIAGRAM — drawn like dots on a rosewood fretboard
   ============================================================ */
function Diagram({ frets }) {
  const W = 132, H = 168;
  const padL = 16, padR = 16, padT = 30, padB = 22;
  const cols = 6, rows = 4;
  const gx = (W - padL - padR) / (cols - 1);
  const gy = (H - padT - padB) / rows;

  const fretted = frets.filter((f) => f != null && f > 0);
  const minF = fretted.length ? Math.min(...fretted) : 0;
  const baseFret = minF > 2 ? minF - 1 : 0; // window start (0 == nut)

  const sx = (i) => padL + i * gx;
  const fy = (row) => padT + row * gy; // row 0 == top edge

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {/* fretboard panel */}
      <rect x={padL - 8} y={padT - 2} width={W - padL - padR + 16} height={rows * gy + 4}
        rx="3" fill={T.rose} stroke={T.line} strokeWidth="1" />
      {/* nut or position label */}
      {baseFret === 0 ? (
        <rect x={padL - 8} y={padT - 4} width={W - padL - padR + 16} height="4" fill={T.bone} rx="1" />
      ) : (
        <text x={W - padR + 6} y={padT + gy * 0.62} fontSize="10" fill={T.brass}
          fontFamily="'DM Mono', ui-monospace, monospace" textAnchor="start">{baseFret + 1}fr</text>
      )}
      {/* frets (brass) */}
      {Array.from({ length: rows }).map((_, r) => (
        <line key={r} x1={padL - 8} y1={fy(r + 1)} x2={W - padR + 8} y2={fy(r + 1)}
          stroke={T.brassDim} strokeWidth="1.4" opacity="0.7" />
      ))}
      {/* strings */}
      {Array.from({ length: cols }).map((_, i) => (
        <line key={i} x1={sx(i)} y1={padT} x2={sx(i)} y2={padT + rows * gy}
          stroke={T.boneDim} strokeWidth={0.7 + i * 0.18} opacity="0.85" />
      ))}
      {/* markers above the nut: open / muted */}
      {frets.map((f, i) => {
        if (f === 0)
          return <circle key={i} cx={sx(i)} cy={padT - 12} r="4" fill="none" stroke={T.bone} strokeWidth="1.4" />;
        if (f == null)
          return (
            <g key={i} stroke={T.bad} strokeWidth="1.4">
              <line x1={sx(i) - 3.5} y1={padT - 15.5} x2={sx(i) + 3.5} y2={padT - 8.5} />
              <line x1={sx(i) - 3.5} y1={padT - 8.5} x2={sx(i) + 3.5} y2={padT - 15.5} />
            </g>
          );
        return null;
      })}
      {/* fretted dots (bone) */}
      {frets.map((f, i) => {
        if (f == null || f === 0) return null;
        const row = f - baseFret;
        return (
          <g key={i}>
            <circle cx={sx(i)} cy={fy(row) - gy / 2} r="6.5" fill={T.bone} stroke={T.ink} strokeWidth="0.5" />
            <text x={sx(i)} y={fy(row) - gy / 2 + 3.2} fontSize="8" fill={T.ink} textAnchor="middle"
              fontFamily="'DM Mono', ui-monospace, monospace">{f}</text>
          </g>
        );
      })}
      {/* string names */}
      {OPEN_LABELS.map((l, i) => (
        <text key={i} x={sx(i)} y={H - 7} fontSize="9.5" fill={T.muted} textAnchor="middle"
          fontFamily="'DM Mono', ui-monospace, monospace">{l}</text>
      ))}
    </svg>
  );
}

function ChordCard({ ch, voicings }) {
  return (
    <div className="rounded-lg p-3" style={{ background: T.woodHi, border: `1px solid ${T.line}` }}>
      <div className="flex items-baseline justify-between mb-2">
        <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, color: T.bone, fontWeight: 600 }}>
          {ch.display}
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: T.muted }}>
          {[...new Set(ch.pcs)].map((p) => PC[p]).join(" ")}
        </span>
      </div>
      {voicings.length === 0 ? (
        <p style={{ color: T.muted, fontSize: 12 }}>No clean voicing found in this fret window.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {voicings.map((v, k) => (
            <div key={k} className="rounded p-1" style={{ background: T.wood }}>
              <Diagram frets={v.frets} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   APP
   ============================================================ */
const PRESETS = {
  "Modal folk (D)": "D Dsus4 G Em7 Cadd9 Asus4",
  "Celtic Am": "Am C G D F",
  "Singer-songwriter": "G D Em C",
  "Bluesy in A": "A7 D7 E7",
};

export default function App() {
  const [input, setInput] = useState("D Dsus4 G Em7 Cadd9 Asus4");
  const [maxFret, setMaxFret] = useState(12);
  const [shapes, setShapes] = useState(4);

  const tokens = useMemo(
    () => input.split(/[\s,|]+/).map((t) => t.trim()).filter(Boolean),
    [input]
  );
  const results = useMemo(
    () =>
      tokens.map((tok) => {
        const ch = parseChord(tok);
        return { tok, ch, voicings: ch ? findVoicings(ch, maxFret, shapes) : [] };
      }),
    [tokens, maxFret, shapes]
  );
  const unknown = results.filter((r) => !r.ch).map((r) => r.tok);

  return (
    <div style={{ background: T.ink, minHeight: "100vh", color: T.bone }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input, textarea, button { font-family: inherit; }
        .fld:focus { outline: 2px solid ${T.brass}; outline-offset: 1px; }`}</style>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "28px 18px 60px" }}>
        {/* ---- HEADER / SIGNATURE ---- */}
        <header className="mb-6">
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 3, color: T.brass, textTransform: "uppercase" }}>
            Open tuning · low → high
          </div>
          <div className="flex items-center gap-3 mt-1 mb-3">
            {OPEN_LABELS.map((l, i) => (
              <div key={i} className="flex flex-col items-center">
                <div style={{ width: 1.4 + i * 0.5, height: 26, background: T.brass, opacity: 0.85 }} />
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: T.bone, marginTop: 4 }}>{l}</span>
              </div>
            ))}
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 40, fontWeight: 700, marginLeft: 14, lineHeight: 1 }}>
              DADGAD<span style={{ color: T.brass }}>.</span>
            </h1>
          </div>
          <p style={{ color: T.boneDim, fontSize: 14, maxWidth: 560 }}>
            Type a song's chords from standard tuning. The names don't change — but the shapes do.
            Here are the most open, drone-friendly ways to play each one in DADGAD.
          </p>
        </header>

        {/* ---- INPUT ---- */}
        <div className="rounded-lg p-3 mb-4" style={{ background: T.wood, border: `1px solid ${T.line}` }}>
          <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.muted }}>Chords</label>
          <textarea
            className="fld w-full mt-1 rounded p-2"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            style={{ background: T.ink, color: T.bone, border: `1px solid ${T.line}`, resize: "vertical", fontSize: 16 }}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(PRESETS).map(([name, val]) => (
              <button key={name} onClick={() => setInput(val)}
                className="rounded px-2 py-1"
                style={{ background: T.woodHi, border: `1px solid ${T.line}`, color: T.boneDim, fontSize: 12 }}>
                {name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-6 mt-3">
            <label className="flex items-center gap-2" style={{ fontSize: 12, color: T.boneDim }}>
              Shapes each
              <input type="range" min={1} max={4} value={shapes}
                onChange={(e) => setShapes(+e.target.value)} style={{ accentColor: T.brass }} />
              <span style={{ fontFamily: "'DM Mono', monospace", color: T.brass }}>{shapes}</span>
            </label>
            <label className="flex items-center gap-2" style={{ fontSize: 12, color: T.boneDim }}>
              Reach to fret
              <input type="range" min={5} max={15} value={maxFret}
                onChange={(e) => setMaxFret(+e.target.value)} style={{ accentColor: T.brass }} />
              <span style={{ fontFamily: "'DM Mono', monospace", color: T.brass }}>{maxFret}</span>
            </label>
          </div>
          {unknown.length > 0 && (
            <p className="mt-2" style={{ color: T.bad, fontSize: 12 }}>
              Couldn't read: {unknown.join(", ")} — try forms like G, Em7, Cadd9, Dsus4, A7, F#m, G/B.
            </p>
          )}
        </div>

        {/* ---- RESULTS ---- */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {results.filter((r) => r.ch).map((r, i) => (
            <ChordCard key={i} ch={r.ch} voicings={r.voicings} />
          ))}
        </div>

        {/* ---- READING KEY ---- */}
        <div className="mt-6 rounded-lg p-3" style={{ background: T.wood, border: `1px solid ${T.line}` }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.brass, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
            Reading the boxes
          </div>
          <p style={{ color: T.boneDim, fontSize: 13, lineHeight: 1.5 }}>
            Strings run left → right as <b style={{ color: T.bone }}>D A D G A D</b> (low to high). A ring above the nut means
            play that string open; an <span style={{ color: T.bad }}>✕</span> means don't play it. Numbers in the bone dots are
            fret numbers. Voicings that keep the open D and A strings ringing are ranked first — that drone is the whole
            point of DADGAD, so lean into it rather than fighting for textbook shapes.
          </p>
        </div>
      </div>
    </div>
  );
}
