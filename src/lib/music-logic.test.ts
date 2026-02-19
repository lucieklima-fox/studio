import { 
  midiToStaffIndex, 
  noteToMidi, 
  isCorrectAnswer, 
  MusicalNote,
  midiToNote
} from './music-logic';

describe('Music Logic - Interval Math & Staff Positioning', () => {
  test('Treble Clef: Middle C (C4) resolves to index -1', () => {
    const c4 = 60;
    expect(midiToStaffIndex(c4, 'treble')).toBe(-1);
  });

  test('Treble Clef: Anchors (E4, F5)', () => {
    expect(midiToStaffIndex(64, 'treble')).toBe(1); // Bottom line
    expect(midiToStaffIndex(77, 'treble')).toBe(9); // Top line
  });

  test('Bass Clef: Middle C (C4) resolves to index 9', () => {
    const c4 = 60;
    expect(midiToStaffIndex(c4, 'bass')).toBe(9);
  });

  test('Bass Clef: Anchors (G2, A3)', () => {
    expect(midiToStaffIndex(43, 'bass')).toBe(-1); // Bottom line
    expect(midiToStaffIndex(57, 'bass')).toBe(7);  // Top line
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
    expect(isCorrectAnswer(note, { letter: 'D', octave: 4, accidental: 'natural' })).toBe(false);
  });
});
