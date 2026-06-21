export const PITCH_CLASSES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
export type PitchClass = (typeof PITCH_CLASSES)[number];

export const DADGAD_STRINGS = [38, 45, 50, 55, 57, 62]; // D2 A2 D3 G3 A3 D4 (low -> high)
export const DADGAD_OPEN_LABELS = ["D", "A", "D", "G", "A", "D"];

export const NOTE_TO_PITCH: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, DB: 1, D: 2, "D#": 3, Eb: 3, EB: 3, E: 4, Fb: 4, FB: 4,
  F: 5, "E#": 5, "F#": 6, Gb: 6, GB: 6, G: 7, "G#": 8, Ab: 8, AB: 8, A: 9,
  "A#": 10, Bb: 10, BB: 10, B: 11, Cb: 11, CB: 11, "B#": 0,
};

export interface ChordQuality {
  intervals: number[];
}

export const CHORD_QUALITIES: Record<string, ChordQuality> = {
  "": { intervals: [0, 4, 7] },
  maj: { intervals: [0, 4, 7] },
  M: { intervals: [0, 4, 7] },
  m: { intervals: [0, 3, 7] },
  min: { intervals: [0, 3, 7] },
  "-": { intervals: [0, 3, 7] },
  "5": { intervals: [0, 7] },
  sus2: { intervals: [0, 2, 7] },
  sus4: { intervals: [0, 5, 7] },
  sus: { intervals: [0, 5, 7] },
  "7": { intervals: [0, 4, 7, 10] },
  dom7: { intervals: [0, 4, 7, 10] },
  maj7: { intervals: [0, 4, 7, 11] },
  M7: { intervals: [0, 4, 7, 11] },
  m7: { intervals: [0, 3, 7, 10] },
  min7: { intervals: [0, 3, 7, 10] },
  "6": { intervals: [0, 4, 7, 9] },
  m6: { intervals: [0, 3, 7, 9] },
  dim: { intervals: [0, 3, 6] },
  dim7: { intervals: [0, 3, 6, 9] },
  m7b5: { intervals: [0, 3, 6, 10] },
  aug: { intervals: [0, 4, 8] },
  "+": { intervals: [0, 4, 8] },
  add9: { intervals: [0, 4, 7, 2] },
  "9": { intervals: [0, 4, 7, 10, 2] },
  m9: { intervals: [0, 3, 7, 10, 2] },
  maj9: { intervals: [0, 4, 7, 11, 2] },
  "7sus4": { intervals: [0, 5, 7, 10] },
};

export interface ParsedChord {
  name: string;
  display: string;
  root: string;
  rootPc: number;
  quality: string;
  intervals: number[];
  pitchClasses: number[];
  essentialPcs: number[];
  bassPc: number | null;
}

export interface Voicing {
  frets: (number | null)[];
  notes: string[];
  score: number;
}

export interface VoicingOptions {
  maxFret?: number;
  limit?: number;
}
