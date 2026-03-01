/**
 * @fileOverview Core music constants for the Melody Maestro application.
 * Focused strictly on the educational range C2 to C6.
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

export const OCTAVES = [2, 3, 4, 5, 6] as const;

export const KEYBOARD_RANGE = {
  minMidi: 36, // C2
  maxMidi: 84  // C6
};
