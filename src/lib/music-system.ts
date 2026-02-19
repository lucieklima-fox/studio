/**
 * @fileOverview Music system configuration and validation.
 * Enforces strict consistency for the C2-C5 range.
 */

import { KEYBOARD_RANGE } from './music-constants';
import { midiToNote, noteToMidi } from './music-logic';

export type MusicSystemConfig = {
  keyboardMidis: number[];
  allowedStaffMidis: number[];
};

/**
 * Derives staff-safe notes from the keyboard range.
 */
function deriveStaffNotes(keyboardMidis: number[]): number[] {
  // All notes between C2 and C5 are readable in our system
  return [...keyboardMidis];
}

/**
 * Bootstraps the music system with validated ranges.
 */
export function initializeMusicSystem(): MusicSystemConfig {
  const startMidi = KEYBOARD_RANGE.minMidi;
  const endMidi = KEYBOARD_RANGE.maxMidi;
  
  const keyboardMidis = [];
  for (let m = startMidi; m <= endMidi; m++) {
    keyboardMidis.push(m);
  }

  const config = {
    keyboardMidis,
    allowedStaffMidis: deriveStaffNotes(keyboardMidis)
  };

  // Basic sanity check
  if (config.keyboardMidis.length === 0) throw new Error("Music system failed to initialize");

  return config;
}

/**
 * Global singleton configuration.
 */
export const musicSystemConfig = initializeMusicSystem();
