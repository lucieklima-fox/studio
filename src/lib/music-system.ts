'use client';

import { midiToNote, noteToMidi, midiToStaffIndex } from './music-logic';

/**
 * @fileOverview Hard safety layer for the music system.
 * Centralizes configuration and enforces strict consistency checks at boot.
 */

export const KEYBOARD_RANGE = {
  minMidi: 36, // C2
  maxMidi: 96  // C7
};

export type MusicSystemConfig = {
  keyboardMidis: number[];
  allowedStaffMidis: number[];
};

/**
 * Validates the music system configuration against strict rules.
 */
export function validateMusicSystem(config: MusicSystemConfig): void {
  const { keyboardMidis, allowedStaffMidis } = config;

  if (keyboardMidis.length === 0) {
    throw new Error("Music system configuration invalid: keyboardMidis must not be empty");
  }

  const minMidi = Math.min(...keyboardMidis);
  const maxMidi = Math.max(...keyboardMidis);

  if (minMidi < KEYBOARD_RANGE.minMidi) throw new Error("Music system configuration invalid: Keyboard below C2");
  if (maxMidi > KEYBOARD_RANGE.maxMidi) throw new Error("Music system configuration invalid: Keyboard above C7");

  // Integrity Check: Every staff note must be playable
  const keySet = new Set(keyboardMidis);
  allowedStaffMidis.forEach(midi => {
    if (!keySet.has(midi)) {
      throw new Error(`Music system configuration invalid: Staff MIDI ${midi} is not playable on the keyboard`);
    }
  });

  // Stability Check: MIDI <-> Note conversion
  keyboardMidis.forEach(midi => {
    const note = midiToNote(midi, 'treble');
    if (noteToMidi(note) !== midi) {
      throw new Error(`Music system configuration invalid: Audio/MIDI conversion mismatch for MIDI ${midi}`);
    }
  });

  if (process.env.NODE_ENV === 'development') {
    Object.freeze(config);
    Object.freeze(config.keyboardMidis);
    Object.freeze(config.allowedStaffMidis);
  }
}

/**
 * Derives staff-safe notes (within a reasonable display range) from the keyboard range.
 */
function deriveStaffNotes(keyboardMidis: number[]): number[] {
  return keyboardMidis.filter(midi => {
    // Limit staff display to a standard readable range with reasonable ledger lines
    const trebleIndex = midiToStaffIndex(midi, "treble");
    const bassIndex = midiToStaffIndex(midi, "bass");
    return (trebleIndex >= -6 && trebleIndex <= 14) || 
           (bassIndex >= -6 && bassIndex <= 14);
  });
}

/**
 * Bootstraps the music system with validated ranges.
 */
export function initializeMusicSystem(startMidi: number = 36, keyCount: number = 61): MusicSystemConfig {
  const keyboardMidis = Array.from({ length: keyCount }, (_, i) => startMidi + i);
  const allowedStaffMidis = deriveStaffNotes(keyboardMidis);

  const config = {
    keyboardMidis,
    allowedStaffMidis
  };

  validateMusicSystem(config);

  return config;
}

/**
 * Global singleton configuration.
 */
export const musicSystemConfig = initializeMusicSystem();
