'use client';

/**
 * @fileOverview Core music logic for note validation, MIDI mapping, and staff positions.
 * Rewritten for absolute precision using interval-based math.
 */

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

// ---------- CONSTANTS & MAPS ----------

const letterIndexMap: Record<NoteLetter, number> = {
  C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6
};

const baseOffsetMap: Record<NoteLetter, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11
};

// Reference points for staff positioning (Diatonic indices)
// Middle C (C4) is 4 * 7 + 0 = 28
// Treble Bottom Line (E4) is 4 * 7 + 2 = 30
// Bass Bottom Line (G2) is 2 * 7 + 4 = 18
const trebleBaseIndex = 30; 
const bassBaseIndex = 18;

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
  const octaveStr = tone.match(/\d+$/)?.[0] || "4";
  const octave = parseInt(octaveStr);
  
  return noteToMidi({
    letter,
    octave,
    accidental: isSharp ? 'sharp' : 'natural',
    clef: 'treble' 
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
 * Standard staff lines are 0, 2, 4, 6, 8.
 */
export function getLedgerLines(staffIndex: number): number[] {
  const lines: number[] = [];
  if (staffIndex < 0) {
    // Ledger lines below: -2, -4, -6...
    for (let i = -2; i >= staffIndex; i -= 2) {
      lines.push(i);
    }
  } else if (staffIndex > 8) {
    // Ledger lines above: 10, 12, 14...
    for (let i = 10; i <= staffIndex; i += 2) {
      lines.push(i);
    }
  }
  return lines;
}

// ---------- VALIDATION ----------

/**
 * Strict equality validation using MIDI numbers.
 */
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

/**
 * Generates a random note from a specific pool of MIDI numbers.
 */
export function generateRandomNote(clef: Clef, allowedMidis: number[]): MusicalNote {
  if (allowedMidis.length === 0) throw new Error("No MIDI pool provided for random note generation");
  const randomIndex = Math.floor(Math.random() * allowedMidis.length);
  const midi = allowedMidis[randomIndex];
  return midiToNote(midi, clef);
}
