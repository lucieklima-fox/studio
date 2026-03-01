/**
 * @fileOverview Core music constants for the Melody Maestro application.
 * Focused on the range A1 (Kontra) to G6 (Tříčárkovaná) based on Czech standards.
 */

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export type NoteName = typeof NOTE_NAMES[number];

export const PIANO_KEYS = [
  { name: 'C', type: 'white' },
  { name: 'C#', type: 'black' },
  { name: 'D', type: 'white' },
  { name: 'D#', type: 'black' },
  { name: 'E', type: 'white' },
  { name: 'F', type: 'white' },
  { name: 'F#', type: 'black' },
  { name: 'G', type: 'white' },
  { name: 'G#', type: 'black' },
  { name: 'A', type: 'white' },
  { name: 'A#', type: 'black' },
  { name: 'B', type: 'white' },
] as const;

export const OCTAVES = [1, 2, 3, 4, 5, 6] as const;

export const KEYBOARD_RANGE = {
  minMidi: 33, // A1 (Kontra A)
  maxMidi: 91  // G6 (Tříčárkované G)
};

export const CZECH_OCTAVE_LABELS = {
  1: "Kontra",
  2: "Velká",
  3: "Malá",
  4: "Jednočárkovaná",
  5: "Dvoučárkovaná",
  6: "Tříčárkovaná"
};
