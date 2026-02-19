'use client';

import { MusicalNote, midiToNote, noteToMidi, Clef } from './music-logic';

/**
 * @fileOverview Hard safety layer for the music system.
 * Centralizes configuration and enforces strict consistency checks at boot.
 */

export type MusicSystemConfig = {
  keyboardMidis: number[];
  allowedStaffMidis: number[];
};

/**
 * Validates the music system configuration against strict rules.
 * Throws early and descriptively if any inconsistency is found.
 */
export function validateMusicSystem(config: MusicSystemConfig): void {
  const { keyboardMidis, allowedStaffMidis } = config;

  if (keyboardMidis.length === 0) {
    throw new Error("Music system configuration invalid: keyboardMidis must not be empty");
  }

  const uniqueKeyboards = new Set(keyboardMidis);
  if (uniqueKeyboards.size !== keyboardMidis.length) {
    throw new Error("Music system configuration invalid: No duplicates allowed in keyboardMidis");
  }

  const uniqueStaff = new Set(allowedStaffMidis);
  if (uniqueStaff.size !== allowedStaffMidis.length) {
    throw new Error("Music system configuration invalid: No duplicates allowed in allowedStaffMidis");
  }

  // 1. Every allowedStaffMidis value must exist in keyboardMidis
  for (const midi of allowedStaffMidis) {
    if (!uniqueKeyboards.has(midi)) {
      throw new Error(`Music system configuration invalid: Staff MIDI ${midi} is not playable on the keyboard`);
    }
  }

  // 2. All MIDI values must be integers
  // 3. MIDI values must be within valid musical range (0–127)
  [...keyboardMidis, ...allowedStaffMidis].forEach(midi => {
    if (!Number.isInteger(midi)) {
      throw new Error(`Music system configuration invalid: MIDI value ${midi} must be an integer`);
    }
    if (midi < 0 || midi > 127) {
      throw new Error(`Music system configuration invalid: MIDI value ${midi} out of range (0-127)`);
    }
  });

  // 4. Min MIDI <= Max MIDI check (Implicit in Sorted Array, but let's be explicit)
  const sortedKeyboard = [...keyboardMidis].sort((a, b) => a - b);
  if (sortedKeyboard[0] > sortedKeyboard[sortedKeyboard.length - 1]) {
    throw new Error("Music system configuration invalid: Keyboard range calculation corrupted");
  }

  // 5. Audio Consistency Check: MIDI <-> Note stability
  keyboardMidis.forEach(midi => {
    const note = midiToNote(midi, 'treble');
    if (noteToMidi(note) !== midi) {
      throw new Error(`Music system configuration invalid: Audio/MIDI conversion mismatch for MIDI ${midi}`);
    }
  });

  // 6. Freeze in development mode
  if (process.env.NODE_ENV === 'development') {
    Object.freeze(config);
    Object.freeze(config.keyboardMidis);
    Object.freeze(config.allowedStaffMidis);
  }
}

/**
 * Determines if a MIDI note is renderable within the app's supported staff range.
 * Range: C2 (36) to C6 (84).
 */
function isRenderableOnStaff(midi: number): boolean {
  return midi >= 36 && midi <= 84;
}

/**
 * Derives staff-safe notes from the keyboard range.
 */
function deriveStaffNotes(keyboardMidis: number[]): number[] {
  return keyboardMidis.filter(midi => isRenderableOnStaff(midi));
}

/**
 * Bootstraps the music system with validated ranges.
 */
export function initializeMusicSystem(startMidi: number = 41, keyCount: number = 44): MusicSystemConfig {
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
 * App will crash during module evaluation if initialization fails.
 */
export const musicSystemConfig = initializeMusicSystem();
