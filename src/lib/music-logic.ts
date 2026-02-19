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
 * Treble Anchor: E4 (MIDI 64) = 1.
 * Bass Anchor: G2 (MIDI 43) = -1.
 */
export function midiToStaffIndex(midi: number, clef: Clef): number {
  const octave = Math.floor(midi / 12) - 1;
  const semitone = midi % 12;
  const letter = SEMITONE_TO_LETTER[semitone];
  
  const absoluteStep = octave * 7 + LETTER_TO_DIATONIC[letter];
  
  if (clef === 'treble') {
    return absoluteStep - 30 + 1; // E4 = 30 absolute steps
  } else {
    return absoluteStep - 18 - 1; // G2 = 18 absolute steps
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
    for (let i = minLine - 2; i >= staffIndex; i -= 2) {
      lines.push(i);
    }
  } else if (staffIndex > maxLine) {
    for (let i = maxLine + 2; i <= staffIndex; i += 2) {
      lines.push(i);
    }
  }
  return lines;
}

/**
 * Strict equality validation for two notes using MIDI.
 */
export function isCorrectAnswer(generated: MusicalNote, userAnswer: Partial<MusicalNote>): boolean {
  if (!userAnswer.letter || userAnswer.octave === undefined || !userAnswer.accidental) return false;
  
  const generatedMidi = noteToMidi(generated);
  const userMidi = noteToMidi({
    ...generated,
    letter: userAnswer.letter,
    octave: userAnswer.octave,
    accidental: userAnswer.accidental as Accidental
  });

  return generatedMidi === userMidi;
}

/**
 * Generates a random note from the validated subset of staff-safe notes.
 */
export function generateRandomNote(clef: Clef, allowedMidis: number[], includeSharps: boolean = true): MusicalNote {
  const randomMidi = allowedMidis[Math.floor(Math.random() * allowedMidis.length)];
  const note = midiToNote(randomMidi, clef);
  
  // Refine for beginner experience: Avoid E# and B# if possible
  if (note.accidental === 'sharp' && !includeSharps) {
    note.accidental = 'natural';
  }

  return note;
}
