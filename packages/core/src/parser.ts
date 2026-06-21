import {
  NOTE_TO_PITCH,
  PITCH_CLASSES,
  CHORD_QUALITIES,
  type ParsedChord,
} from "./types.js";

export function parseChord(name: string): ParsedChord | null {
  const nm = String(name).trim();
  if (!nm) return null;

  let bassPc: number | null = null;
  const slashParts = nm.split("/");
  if (slashParts.length === 2) {
    const bassMatch = slashParts[1].trim().match(/^([A-Ga-g])([#b]?)$/);
    if (bassMatch) {
      const key = (bassMatch[1].toUpperCase() + bassMatch[2]).toUpperCase();
      bassPc = NOTE_TO_PITCH[key] ?? null;
    }
  }

  const match = nm.match(/^([A-Ga-g])([#b]?)(.*)$/);
  if (!match) return null;

  const root = match[1].toUpperCase() + match[2];
  const rootPc = NOTE_TO_PITCH[root.toUpperCase()];
  if (rootPc == null) return null;

  const quality = match[3].trim();
  if (!(quality in CHORD_QUALITIES)) return null;

  const intervals = CHORD_QUALITIES[quality].intervals;
  const pitchClasses = [...new Set(intervals.map((i) => (rootPc + i) % 12))];

  const essentialIntervals =
    intervals.length <= 2 ? intervals : intervals.filter((i) => i !== 7);
  const essentialPcs = [...new Set(essentialIntervals.map((i) => (rootPc + i) % 12))];

  const displayName = nm + (bassPc != null ? "/" + PITCH_CLASSES[bassPc] : "");

  return {
    name,
    display: displayName,
    root,
    rootPc,
    quality,
    intervals,
    pitchClasses,
    essentialPcs,
    bassPc,
  };
}

export function parseChordSequence(input: string): string[] {
  return input
    .split(/[\s,|]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}
