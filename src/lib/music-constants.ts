export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export type NoteName = typeof NOTE_NAMES[number];

export const PIANO_KEYS = [
  { name: 'C', type: 'white' },
  { name: 'C#', type: 'black' },
  { name: 'D', type: 'white' },
  { name: 'D#', type: 'black' },
  { name: 'E', type: 'white' },
  { name: 'F', type: 'white' },
  { name: 'F#', type: 'black' },
  { name: 'G', type: 'white' },
  { name: 'G#', type: 'black' },
  { name: 'A', type: 'white' },
  { name: 'A#', type: 'black' },
  { name: 'B', type: 'white' },
] as const;

export const OCTAVES = [2, 3, 4, 5] as const;

export type FullNote = {
  name: NoteName;
  octave: number;
  id: string; // e.g., C4
};

export const ALL_NOTES: FullNote[] = OCTAVES.flatMap(octave => 
  NOTE_NAMES.map(name => ({
    name,
    octave,
    id: `${name}${octave}`
  }))
);

export const STAFF_RANGES = {
  treble: { min: 'C4', max: 'C5' },
  bass: { min: 'C2', max: 'C4' },
};

export const MELODIES = [
  {
    name: "Twinkle Twinkle Little Star",
    sequence: ["C4", "C4", "G4", "G4", "A4", "A4", "G4", "F4", "F4", "E4", "E4", "D4", "D4", "C4"],
    display: "C C G G A A G | F F E E D D C"
  },
  {
    name: "Mary Had a Little Lamb",
    sequence: ["E4", "D4", "C4", "D4", "E4", "E4", "E4", "D4", "D4", "D4", "E4", "G4", "G4"],
    display: "E D C D E E E | D D D E G G"
  }
];
