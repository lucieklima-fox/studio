'use client';

/**
 * @fileOverview Centralized music logic for note validation, MIDI mapping, and staff positions.
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

const LETTER_TO_STEP: Record<NoteLetter, number> = {
  'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6
};

const STEP_TO_LETTER: NoteLetter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const LETTER_TO_SEMITONE: Record<NoteLetter, number> = {
  'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
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
 * Returns the Tone.js compatible note string (e.g., "C#4" or "C4").
 */
export function noteToTone(note: MusicalNote): string {
  const accidentalChar = note.accidental === 'sharp' ? '#' : '';
  return `${note.letter}${accidentalChar}${note.octave}`;
}

/**
 * Maps a staff position index to a MusicalNote.
 * staffIndex: 0 is the bottom line of the staff.
 */
export function getNoteFromStaffPosition(
  staffIndex: number,
  clef: Clef,
  accidental: Accidental = 'natural'
): MusicalNote {
  // Reference notes for the bottom line (staffIndex 0)
  // Treble: Bottom line is E4
  // Bass: Bottom line is G2
  const reference = clef === 'treble' 
    ? { letter: 'E' as NoteLetter, octave: 4 }
    : { letter: 'G' as NoteLetter, octave: 2 };

  const refAbsoluteStep = reference.octave * 7 + LETTER_TO_STEP[reference.letter];
  const targetAbsoluteStep = refAbsoluteStep + staffIndex;

  const targetOctave = Math.floor(targetAbsoluteStep / 7);
  const targetStep = ((targetAbsoluteStep % 7) + 7) % 7;
  const targetLetter = STEP_TO_LETTER[targetStep];

  return {
    letter: targetLetter,
    octave: targetOctave,
    accidental,
    clef
  };
}

/**
 * Strict equality validation for two notes.
 */
export function isCorrectAnswer(generated: MusicalNote, userAnswer: Partial<MusicalNote>): boolean {
  return (
    generated.letter === userAnswer.letter &&
    generated.octave === userAnswer.octave &&
    generated.accidental === userAnswer.accidental
  );
}

/**
 * Generates a random note within a safe staff range for the given clef.
 */
export function generateRandomNote(clef: Clef, includeSharps: boolean = true): MusicalNote {
  // Treble safe range: -2 (C4) to 10 (G5)
  // Bass safe range: -2 (E2) to 10 (C4)
  const min = -2;
  const max = 10;
  const staffIndex = Math.floor(Math.random() * (max - min + 1)) + min;
  
  const accidental: Accidental = includeSharps && Math.random() > 0.7 ? 'sharp' : 'natural';
  
  // Some notes don't have sharps in standard practice (E#, B#) for beginners, 
  // but mathematically they exist. We'll skip them for simpler UI if needed.
  let note = getNoteFromStaffPosition(staffIndex, clef, accidental);
  
  if (note.accidental === 'sharp' && (note.letter === 'E' || note.letter === 'B')) {
    note.accidental = 'natural';
  }

  return note;
}
