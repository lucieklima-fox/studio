/**
 * @fileOverview Core music logic for note validation, MIDI mapping, and staff positions.
 * Pure mathematical functions for consistency between A1 and G6.
 */

import { CZECH_OCTAVE_LABELS } from './music-constants';

// ---------- CONSTANTS ----------

const letterIndexMap: Record<string, number> = {
  C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6
};

// Mapování půltónů v rámci oktávy (0-11) pro standardní piano
const semitoneMap: { letter: NoteLetter, accidental: Accidental }[] = [
  { letter: 'C', accidental: 'natural' }, // 0
  { letter: 'C', accidental: 'sharp' },   // 1
  { letter: 'D', accidental: 'natural' }, // 2
  { letter: 'D', accidental: 'sharp' },   // 3
  { letter: 'E', accidental: 'natural' }, // 4
  { letter: 'F', accidental: 'natural' }, // 5
  { letter: 'F', accidental: 'sharp' },   // 6
  { letter: 'G', accidental: 'natural' }, // 7
  { letter: 'G', accidental: 'sharp' },   // 8
  { letter: 'A', accidental: 'natural' }, // 9
  { letter: 'A', accidental: 'sharp' },   // 10
  { letter: 'B', accidental: 'natural' }, // 11
];

const TREBLE_ANCHOR = 30; // E4 (Diatonic index: 4*7 + 2)
const BASS_ANCHOR = 18;   // G2 (Diatonic index: 2*7 + 4)

// ---------- TYPES ----------

export type Accidental = "natural" | "sharp";
export type Clef = "treble" | "bass";
export type NoteLetter = "C" | "D" | "E" | "F" | "G" | "A" | "B";

export type MusicalNote = {
  letter: NoteLetter;
  octave: number;
  accidental: Accidental;
  clef: Clef;
};

// ---------- CORE UTILITIES ----------

export function midiToNote(midi: number, clef: Clef = "treble"): MusicalNote {
  const octave = Math.floor(midi / 12) - 1;
  const semitone = midi % 12;
  const { letter, accidental } = semitoneMap[semitone];

  return { letter, octave, accidental, clef };
}

export function noteToMidi(note: MusicalNote): number {
  const octaveOffset = (note.octave + 1) * 12;
  const semitoneOffset = semitoneMap.findIndex(s => s.letter === note.letter && s.accidental === note.accidental);
  return octaveOffset + semitoneOffset;
}

export function noteToTone(note: MusicalNote): string {
  const accidentalChar = note.accidental === "sharp" ? "#" : "";
  return `${note.letter}${accidentalChar}${note.octave}`;
}

/**
 * Returns the Czech scientific name for the note.
 * Uses 'H' instead of 'B' and specific octave formats.
 */
export function getCzechNoteName(note: MusicalNote): string {
  const isB = note.letter === 'B';
  const letterChar = isB ? 'H' : note.letter;
  const accidental = note.accidental === 'sharp' ? 'is' : '';
  
  // Názvy tónů v malé a vyšších oktávách jsou malým písmem
  const baseName = note.octave >= 3 ? letterChar.toLowerCase() : letterChar;
  const fullBaseName = `${baseName}${accidental}`;

  switch (note.octave) {
    case 1: 
      return `${fullBaseName}1`; // Kontra A1, H1
    case 2: 
      return fullBaseName;      // Velká C, D...
    case 3: 
      return fullBaseName;      // Malá c, d...
    case 4: 
      return `${fullBaseName}1`; // Jednočárkovaná c1...
    case 5: 
      return `${fullBaseName}2`; // Dvoučárkovaná c2...
    case 6: 
      return `${fullBaseName}3`; // Tříčárkovaná c3...
    default: 
      return `${fullBaseName}${note.octave}`;
  }
}

export function getCzechOctaveLabel(octave: number): string {
  return (CZECH_OCTAVE_LABELS as any)[octave] || `Oktáva ${octave}`;
}

export function midiToStaffIndex(midi: number, clef: Clef): number {
  const note = midiToNote(midi, clef);
  const diatonicIndex = note.octave * 7 + letterIndexMap[note.letter];

  return clef === "treble"
    ? diatonicIndex - TREBLE_ANCHOR
    : diatonicIndex - BASS_ANCHOR;
}

export function getLedgerLines(staffIndex: number): number[] {
  const lines: number[] = [];
  if (staffIndex < 0) {
    for (let i = -2; i >= staffIndex; i -= 2) lines.push(i);
  } else if (staffIndex > 8) {
    for (let i = 10; i <= staffIndex; i += 2) lines.push(i);
  }
  return lines;
}

export function isCorrectAnswer(generated: MusicalNote, userAnswer: Partial<MusicalNote>): boolean {
  if (!userAnswer.letter || userAnswer.octave === undefined || !userAnswer.accidental) return false;
  
  const generatedMidi = noteToMidi(generated);
  const userMidi = noteToMidi({
    letter: userAnswer.letter as NoteLetter,
    octave: userAnswer.octave,
    accidental: userAnswer.accidental as Accidental,
    clef: generated.clef
  });

  return generatedMidi === userMidi;
}

export function generateRandomNote(clef: Clef, allowedMidis: number[]): MusicalNote {
  if (allowedMidis.length === 0) return midiToNote(60, clef);
  const randomIndex = Math.floor(Math.random() * allowedMidis.length);
  return midiToNote(allowedMidis[randomIndex], clef);
}
