/**
 * @fileOverview Music system configuration and validation.
 * Enforces strict consistency for the A1-G6 range.
 */

import { KEYBOARD_RANGE, CZECH_OCTAVE_LABELS } from '../music-constants';

export type MusicSystemConfig = {
  keyboardMidis: number[];
  allowedStaffMidis: number[];
  czechOctaveLabels: Record<number, string>;
};

function deriveStaffNotes(keyboardMidis: number[]): number[] {
  return [...keyboardMidis];
}

export function initializeMusicSystem(): MusicSystemConfig {
  const startMidi = KEYBOARD_RANGE.minMidi;
  const endMidi = KEYBOARD_RANGE.maxMidi;
  
  const keyboardMidis = [];
  for (let m = startMidi; m <= endMidi; m++) {
    keyboardMidis.push(m);
  }

  const config = {
    keyboardMidis,
    allowedStaffMidis: deriveStaffNotes(keyboardMidis),
    czechOctaveLabels: CZECH_OCTAVE_LABELS
  };

  if (config.keyboardMidis.length === 0) throw new Error("Music system failed to initialize");

  return config;
}

export const musicSystemConfig = initializeMusicSystem();
