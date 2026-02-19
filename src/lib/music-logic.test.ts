import { 
  getNoteFromStaffPosition, 
  noteToMidi, 
  isCorrectAnswer, 
  MusicalNote 
} from './music-logic';

describe('Music Logic Utilities', () => {
  test('getNoteFromStaffPosition treble clef mapping', () => {
    // E4 is bottom line (index 0)
    expect(getNoteFromStaffPosition(0, 'treble')).toMatchObject({ letter: 'E', octave: 4 });
    // F4 is space 1 (index 1)
    expect(getNoteFromStaffPosition(1, 'treble')).toMatchObject({ letter: 'F', octave: 4 });
    // C4 is ledger line below (index -2)
    expect(getNoteFromStaffPosition(-2, 'treble')).toMatchObject({ letter: 'C', octave: 4 });
    // G5 is space above line 5 (index 9)
    expect(getNoteFromStaffPosition(9, 'treble')).toMatchObject({ letter: 'G', octave: 5 });
  });

  test('getNoteFromStaffPosition bass clef mapping', () => {
    // G2 is bottom line (index 0)
    expect(getNoteFromStaffPosition(0, 'bass')).toMatchObject({ letter: 'G', octave: 2 });
    // A2 is space 1 (index 1)
    expect(getNoteFromStaffPosition(1, 'bass')).toMatchObject({ letter: 'A', octave: 2 });
    // C4 is ledger line above (index 10)
    expect(getNoteFromStaffPosition(10, 'bass')).toMatchObject({ letter: 'C', octave: 4 });
  });

  test('noteToMidi conversions', () => {
    const middleC: MusicalNote = { letter: 'C', octave: 4, accidental: 'natural', clef: 'treble' };
    expect(noteToMidi(middleC)).toBe(60);

    const fSharp4: MusicalNote = { letter: 'F', octave: 4, accidental: 'sharp', clef: 'treble' };
    expect(noteToMidi(fSharp4)).toBe(66); // F4 is 65 + sharp = 66
  });

  test('isCorrectAnswer strict validation', () => {
    const note1: MusicalNote = { letter: 'F', octave: 4, accidental: 'sharp', clef: 'treble' };
    const note2: MusicalNote = { letter: 'F', octave: 4, accidental: 'natural', clef: 'treble' };
    const note3: MusicalNote = { letter: 'F', octave: 5, accidental: 'sharp', clef: 'treble' };

    expect(isCorrectAnswer(note1, note1)).toBe(true);
    expect(isCorrectAnswer(note1, note2)).toBe(false); // Accidental mismatch
    expect(isCorrectAnswer(note1, note3)).toBe(false); // Octave mismatch
  });
});
