'use client';

/**
 * @fileOverview Core music logic for note validation, MIDI mapping, and staff positions.
 */

export type Accidental = "natural" | "sharp";
export type Clef = "treble" | "bass";
export type NoteLetter = "C" | "D" | "E" | "F" | "G" | "A" | "B";

export type MusicalNote = {
  letter: NoteLetter;
  octave: number;
  accidental: Accidental;
  clef: Clef;
};

// ---------- CONSTANTS & MAPS ----------

const letterIndexMap: Record<NoteLetter, number> = {
  C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6
};

const baseOffsetMap: Record<NoteLetter, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11
};

const trebleBaseIndex = 4 * 7 + 2; // E4 = 0 (bottom line)
const bassBaseIndex = 2 * 7 + 4;   // G2 = 0 (bottom line)

// ---------- MIDI ↔ NOTE CONVERSION ----------

/**
 * Returns a MusicalNote object from a MIDI number.
 */
export function midiToNote(midi: number, clef: Clef = "treble"): MusicalNote {
  if (midi < 0 || midi > 127) throw new Error(`Invalid MIDI ${midi}`);

  const octave = Math.floor(midi / 12) - 1;
  const semitone = midi % 12;

  let letter: NoteLetter = "C";
  let accidental: Accidental = "natural";

  // Check natural notes first
  for (const [ltr, offset] of Object.entries(baseOffsetMap)) {
    if (offset === semitone) {
      letter = ltr as NoteLetter;
      accidental = "natural";
      return { letter, octave, accidental, clef };
    }
  }

  // Check sharp notes
  for (const [ltr, offset] of Object.entries(baseOffsetMap)) {
    if (offset + 1 === semitone) {
      letter = ltr as NoteLetter;
      accidental = "sharp";
      return { letter, octave, accidental, clef };
    }
  }

  return { letter, octave, accidental, clef };
}

/**
 * Returns the deterministic MIDI number for a given note.
 */
export function noteToMidi(note: MusicalNote): number {
  const base = baseOffsetMap[note.letter];
  const accidentalOffset = note.accidental === "sharp" ? 1 : 0;
  return 12 * (note.octave + 1) + base + accidentalOffset;
}

/**
 * Returns the Tone.js compatible note string (e.g., "C#4" or "C4").
 */
export function noteToTone(note: MusicalNote): string {
  const accidentalChar = note.accidental === "sharp" ? "#" : "";
  return `${note.letter}${accidentalChar}${note.octave}`;
}

/**
 * Converts a Tone.js string back to MIDI.
 */
export function toneToMidi(tone: string): number {
  const letter = tone.charAt(0) as NoteLetter;
  const isSharp = tone.includes('#');
  const octave = parseInt(tone.slice(-1));
  
  return noteToMidi({
    letter,
    octave,
    accidental: isSharp ? 'sharp' : 'natural',
    clef: 'treble' // clef doesn't affect MIDI
  });
}

// ---------- STAFF INDEX CALCULATION ----------

/**
 * Calculates the diatonic staff index (line/space steps).
 * 0 = Bottom Line of the clef (E4 for treble, G2 for bass).
 */
export function midiToStaffIndex(midi: number, clef: Clef): number {
  const note = midiToNote(midi, clef);
  const diatonicIndex = note.octave * 7 + letterIndexMap[note.letter];

  return clef === "treble"
    ? diatonicIndex - trebleBaseIndex
    : diatonicIndex - bassBaseIndex;
}

/**
 * Generates relative staff indices for ledger lines.
 */
export function getLedgerLines(staffIndex: number): number[] {
  const lines: number[] = [];
  // Standard lines are index 0, 2, 4, 6, 8
  if (staffIndex < 0) {
    // Indices -2, -4 etc. are ledger lines below
    for (let i = -2; i >= staffIndex; i -= 2) {
      lines.push(i);
    }
  } else if (staffIndex > 8) {
    // Indices 10, 12 etc. are ledger lines above
    for (let i = 10; i <= staffIndex; i -= 2) {
      lines.push(i);
    }
  }
  return lines;
}

// ---------- VALIDATION ----------

/**
 * Strict equality validation for two notes.
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
 * Generates a random note from the validated pool.
 */
export function generateRandomNoteFromPool(clef: Clef, allowedMidis: number[]): MusicalNote {
  const randomIndex = Math.floor(Math.random() * allowedMidis.length);
  const midi = allowedMidis[randomIndex];
  return midiToNote(midi, clef);
}
