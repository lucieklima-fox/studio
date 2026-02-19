'use client';

/**
 * @fileOverview Core music logic for note validation, MIDI mapping, and staff positions.
 * Uses a deterministic diatonic system (steps) for staff positioning and 
 * an absolute MIDI system for pitch validation.
 */

// ---------- CONSTANTS ----------

export const KEYBOARD_RANGE = {
  minMidi: 36, // C2
  maxMidi: 72  // C5
};

const letterIndexMap: Record<string, number> = {
  C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6
};

const baseOffsetMap: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11
};

/**
 * Reference points for staff positioning (Diatonic indices)
 * Index = (Octave * 7) + LetterIndex
 * Middle C (C4) = (4 * 7) + 0 = 28
 * Treble Clef Bottom Line (E4) = (4 * 7) + 2 = 30
 * Bass Clef Bottom Line (G2) = (2 * 7) + 4 = 18
 */
const TREBLE_ANCHOR = 30; // E4
const BASS_ANCHOR = 18;   // G2

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

/**
 * Returns a MusicalNote object from a MIDI number.
 * Accidentals are resolved to sharps.
 */
export function midiToNote(midi: number, clef: Clef = "treble"): MusicalNote {
  if (midi < 0 || midi > 127) throw new Error(`Invalid MIDI ${midi}`);

  const octave = Math.floor(midi / 12) - 1;
  const semitone = midi % 12;

  let letter: NoteLetter = "C";
  let accidental: Accidental = "natural";

  // Reverse map semitone to letter
  const entries = Object.entries(baseOffsetMap);
  for (const [ltr, offset] of entries) {
    if (offset === semitone) {
      letter = ltr as NoteLetter;
      accidental = "natural";
      break;
    } else if (offset + 1 === semitone) {
      letter = ltr as NoteLetter;
      accidental = "sharp";
      break;
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
 * Calculates the diatonic staff index (line/space steps).
 * 0 = Bottom Line of the clef (E4 for treble, G2 for bass).
 */
export function midiToStaffIndex(midi: number, clef: Clef): number {
  const note = midiToNote(midi, clef);
  const diatonicIndex = note.octave * 7 + letterIndexMap[note.letter];

  return clef === "treble"
    ? diatonicIndex - TREBLE_ANCHOR
    : diatonicIndex - BASS_ANCHOR;
}

/**
 * Generates relative staff indices for ledger lines.
 * Staff lines are at indices 0, 2, 4, 6, 8.
 */
export function getLedgerLines(staffIndex: number): number[] {
  const lines: number[] = [];
  if (staffIndex < 0) {
    // Below staff: -2, -4, -6...
    for (let i = -2; i >= staffIndex; i -= 2) {
      lines.push(i);
    }
  } else if (staffIndex > 8) {
    // Above staff: 10, 12, 14...
    for (let i = 10; i <= staffIndex; i += 2) {
      lines.push(i);
    }
  }
  return lines;
}

// ---------- VALIDATION & GENERATION ----------

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
  if (allowedMidis.length === 0) throw new Error("MIDI pool empty");
  const randomIndex = Math.floor(Math.random() * allowedMidis.length);
  return midiToNote(allowedMidis[randomIndex], clef);
}
