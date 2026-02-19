import { 
  midiToStaffIndex, 
  noteToMidi, 
  isCorrectAnswer, 
  MusicalNote,
  midiToNote
} from './music-logic';
import { validateMusicSystem, MusicSystemConfig } from './music-system';

describe('Music System Safety Layer', () => {
  test('rejects staff note outside keyboard range', () => {
    const badConfig: MusicSystemConfig = {
      keyboardMidis: [60, 61, 62],
      allowedStaffMidis: [60, 65] // 65 is missing from keyboard
    };
    expect(() => validateMusicSystem(badConfig)).toThrow(/is not playable on the keyboard/);
  });

  test('rejects duplicate MIDI values', () => {
    const badConfig: MusicSystemConfig = {
      keyboardMidis: [60, 60, 61],
      allowedStaffMidis: [60]
    };
    expect(() => validateMusicSystem(badConfig)).toThrow(/No duplicates allowed/);
  });

  test('rejects non-integer MIDI values', () => {
    const badConfig: MusicSystemConfig = {
      keyboardMidis: [60.5],
      allowedStaffMidis: [60]
    };
    expect(() => validateMusicSystem(badConfig)).toThrow(/must be an integer/);
  });

  test('rejects out of range MIDI values', () => {
    const badConfig: MusicSystemConfig = {
      keyboardMidis: [150],
      allowedStaffMidis: [60]
    };
    expect(() => validateMusicSystem(badConfig)).toThrow(/out of range/);
  });
});

describe('Music Logic - Absolute MIDI & Staff Positioning', () => {
  test('Treble Clef: Middle C (C4) resolves to index -1', () => {
    const c4 = 60;
    expect(midiToStaffIndex(c4, 'treble')).toBe(-1);
  });

  test('Bass Clef: Middle C (C4) resolves to index 9', () => {
    const c4 = 60;
    expect(midiToStaffIndex(c4, 'bass')).toBe(9);
  });

  test('Sharps: Diatonic positioning remains constant', () => {
    const c4 = 60;
    const cSharp4 = 61;
    expect(midiToStaffIndex(c4, 'treble')).toBe(-1);
    expect(midiToStaffIndex(cSharp4, 'treble')).toBe(-1);
  });

  test('Validation: Strict MIDI equality', () => {
    const note: MusicalNote = { letter: 'C', octave: 4, accidental: 'sharp', clef: 'treble' };
    expect(isCorrectAnswer(note, { letter: 'C', octave: 4, accidental: 'sharp' })).toBe(true);
    expect(isCorrectAnswer(note, { letter: 'C', octave: 4, accidental: 'natural' })).toBe(false);
  });
});
