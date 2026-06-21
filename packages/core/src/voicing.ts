import {
  DADGAD_STRINGS,
  PITCH_CLASSES,
  type ParsedChord,
  type Voicing,
  type VoicingOptions,
} from "./types.js";

const DEFAULT_MAX_FRET = 12;
const DEFAULT_LIMIT = 4;

export function findVoicings(
  chord: ParsedChord,
  options: VoicingOptions = {}
): Voicing[] {
  const maxFret = options.maxFret ?? DEFAULT_MAX_FRET;
  const limit = options.limit ?? DEFAULT_LIMIT;

  const stringOptions = DADGAD_STRINGS.map((openMidi) => {
    const allowed: (number | null)[] = [null];
    for (let fret = 0; fret <= maxFret; fret++) {
      if (chord.pitchClasses.includes((openMidi + fret) % 12)) {
        allowed.push(fret);
      }
    }
    return allowed;
  });

  const candidates: { frets: (number | null)[]; score: number }[] = [];
  const current = new Array<number | null>(6);

  function evaluate(): void {
    const sounding: number[] = [];
    for (let i = 0; i < 6; i++) {
      if (current[i] != null) sounding.push(i);
    }
    if (sounding.length < 3) return;

    const soundingPcs = new Set(
      sounding.map((i) => (DADGAD_STRINGS[i] + current[i]!) % 12)
    );
    for (const essential of chord.essentialPcs) {
      if (!soundingPcs.has(essential)) return;
    }

    const fretted = sounding.filter((i) => current[i]! > 0).map((i) => current[i]!);
    let span = 0;
    if (fretted.length) span = Math.max(...fretted) - Math.min(...fretted);
    if (span > 4) return;

    const lo = sounding[0];
    const hi = sounding[sounding.length - 1];
    let interiorGaps = 0;
    for (let i = lo; i <= hi; i++) {
      if (current[i] == null) interiorGaps++;
    }
    if (interiorGaps > 1) return;
    if (fretted.length > 4) return;

    const bassPc = (DADGAD_STRINGS[sounding[0]] + current[sounding[0]]!) % 12;
    if (chord.bassPc != null && !soundingPcs.has(chord.bassPc)) return;

    let score = 0;
    const openCount = sounding.filter((i) => current[i] === 0).length;
    score += openCount * 1.6;
    if (current[0] === 0) score += 1.2;
    if (bassPc === chord.rootPc) score += 3;
    if (chord.bassPc != null && bassPc === chord.bassPc) score += 2.5;
    if (soundingPcs.has((chord.rootPc + 7) % 12)) score += 1;
    score += sounding.length * 0.5;
    score -= interiorGaps * 2;
    score -= span * 0.5;
    score -= fretted.length * 0.3;
    const avgFret = fretted.length
      ? fretted.reduce((a, b) => a + b, 0) / fretted.length
      : 0;
    score -= avgFret * 0.45;

    candidates.push({ frets: [...current], score });
  }

  function recurse(stringIndex: number): void {
    if (stringIndex === 6) {
      evaluate();
      return;
    }
    for (const option of stringOptions[stringIndex]) {
      current[stringIndex] = option;
      recurse(stringIndex + 1);
    }
  }

  recurse(0);

  candidates.sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const unique: typeof candidates = [];
  for (const v of candidates) {
    const key = v.frets.join(",");
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(v);
  }

  return unique.slice(0, limit).map((v) => ({
    frets: v.frets,
    notes: v.frets.map((f, i) =>
      f == null ? "x" : PITCH_CLASSES[(DADGAD_STRINGS[i] + f) % 12]
    ),
    score: v.score,
  }));
}

export function getFretWindow(frets: (number | null)[]): number {
  const fretted = frets.filter((f): f is number => f != null && f > 0);
  const minF = fretted.length ? Math.min(...fretted) : 0;
  return minF > 2 ? minF - 1 : 0;
}
