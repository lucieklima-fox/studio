'use client';

/**
 * @fileOverview Centralized music logic for note validation, MIDI mapping, and staff positions.
 * Uses a deterministic MIDI-based system.
 */

export type NoteLetter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type Accidental = 'natural' | 'sharp';
export type Clef = 'treble' | 'bass';

export interface MusicalNote {
  letter: NoteLetter;
  octave: number;
  accidental: Accidental;
  clef: Clef;
}

const LETTER_TO_SEMITONE: Record<NoteLetter, number> = {
  'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
};

const SEMITONE_TO_LETTER: NoteLetter[] = ['C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B'];

const LETTER_TO_DIATONIC: Record<NoteLetter, number> = {
  'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6
};

const DIATONIC_TO_LETTER: NoteLetter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

/**
 * Returns the deterministic MIDI number for a given note.
 * C4 = 60.
 */
export function noteToMidi(note: MusicalNote): number {
  const baseMidi = (note.octave + 1) * 12 + LETTER_TO_SEMITONE[note.letter];
  return baseMidi + (note.accidental === 'sharp' ? 1 : 0);
}

/**
 * Returns a MusicalNote object from a MIDI number.
 * Defaults to natural notes or sharps.
 */
export function midiToNote(midi: number, clef: Clef): MusicalNote {
  const octave = Math.floor(midi / 12) - 1;
  const semitone = midi % 12;
  const letter = SEMITONE_TO_LETTER[semitone];
  const isSharp = LETTER_TO_SEMITONE[letter] !== semitone;
  
  return {
    letter,
    octave,
    accidental: isSharp ? 'sharp' : 'natural',
    clef
  };
}

/**
 * Returns the Tone.js compatible note string (e.g., "C#4" or "C4").
 */
export function noteToTone(note: MusicalNote): string {
  const accidentalChar = note.accidental === 'sharp' ? '#' : '';
  return `${note.letter}${accidentalChar}${note.octave}`;
}

/**
 * Calculates the diatonic staff index (line/space steps).
 * Treble: Bottom line (E4) = 1. Middle C (C4) = -1.
 * Bass: Bottom line (G2) = -1. Middle C (C4) = 9.
 */
export function midiToStaffIndex(midi: number, clef: Clef): number {
  // Get natural note part (ignore accidental for staff positioning)
  const octave = Math.floor(midi / 12) - 1;
  const semitone = midi % 12;
  const letter = SEMITONE_TO_LETTER[semitone];
  
  const absoluteStep = octave * 7 + LETTER_TO_DIATONIC[letter];
  
  if (clef === 'treble') {
    // Treble Anchor: E4 (MIDI 64) is Index 1. 
    // Absolute step for E4 is 4 * 7 + 2 = 30.
    return absoluteStep - 30 + 1;
  } else {
    // Bass Anchor: G2 (MIDI 43) is Index -1.
    // Absolute step for G2 is 2 * 7 + 4 = 18.
    return absoluteStep - 18 - 1;
  }
}

/**
 * Generates Y positions for ledger lines based on staff index.
 */
export function getLedgerLineIndices(staffIndex: number, clef: Clef): number[] {
  const lines: number[] = [];
  const minLine = clef === 'treble' ? 1 : -1;
  const maxLine = clef === 'treble' ? 9 : 7;

  if (staffIndex < minLine) {
    // Even indices are spaces, odd are lines. 
    // Start from the first line below the staff.
    for (let i = minLine - 2; i >= staffIndex; i -= 2) {
      lines.push(i);
    }
  } else if (staffIndex > maxLine) {
    // Start from the first line above the staff.
    for (let i = maxLine + 2; i <= staffIndex; i += 2) {
      lines.push(i);
    }
  }
  return lines;
}

/**
 * Maps a staff index back to a MIDI number (natural note).
 */
export function staffIndexToMidi(index: number, clef: Clef): number {
  const anchorAbsoluteStep = clef === 'treble' ? 30 : 18;
  const anchorStaffOffset = clef === 'treble' ? 1 : -1;
  
  const targetAbsoluteStep = index - anchorStaffOffset + anchorAbsoluteStep;
  const octave = Math.floor(targetAbsoluteStep / 7);
  const diatonicIndex = ((targetAbsoluteStep % 7) + 7) % 7;
  const letter = DIATONIC_TO_LETTER[diatonicIndex];
  
  return (octave + 1) * 12 + LETTER_TO_SEMITONE[letter];
}

/**
 * Strict equality validation for two notes using MIDI.
 */
export function isCorrectAnswer(generated: MusicalNote, userAnswer: Partial<MusicalNote>): boolean {
  if (!userAnswer.letter || userAnswer.octave === undefined || !userAnswer.accidental) return false;
  
  const generatedMidi = noteToMidi(generated);
  const userMidi = noteToMidi({
    ...generated, // default clef
    letter: userAnswer.letter,
    octave: userAnswer.octave,
    accidental: userAnswer.accidental
  });

  return generatedMidi === userMidi;
}

/**
 * Generates a random note within a safe staff range.
 */
export function generateRandomNote(clef: Clef, includeSharps: boolean = true): MusicalNote {
  // Safe staff range: approx 2 ledger lines below to 2 above
  const min = clef === 'treble' ? -3 : -5;
  const max = clef === 'treble' ? 13 : 11;
  
  const staffIndex = Math.floor(Math.random() * (max - min + 1)) + min;
  const baseMidi = staffIndexToMidi(staffIndex, clef);
  const note = midiToNote(baseMidi, clef);
  
  if (includeSharps && Math.random() > 0.7) {
    // Only add sharp if standard (no E# or B# for beginners)
    if (note.letter !== 'E' && note.letter !== 'B') {
      note.accidental = 'sharp';
    }
  }

  return note;
}
