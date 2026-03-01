
"use client";

import React, { useMemo } from 'react';
import { KEYBOARD_RANGE } from '@/lib/music-constants';
import { cn } from '@/lib/utils';
import { midiToNote, getCzechNoteName } from '@/lib/music-logic';

interface PianoKeyboardProps {
  activeNotes?: string[];
  onNoteClick?: (noteId: string) => void;
  highlightMiddleC?: boolean;
  className?: string;
}

export function PianoKeyboard({ 
  activeNotes = [], 
  onNoteClick, 
  highlightMiddleC = true,
  className 
}: PianoKeyboardProps) {
  const allKeys = useMemo(() => {
    const keys = [];
    // Rozsah A1 (33) až G6 (91)
    for (let midi = KEYBOARD_RANGE.minMidi; midi <= KEYBOARD_RANGE.maxMidi; midi++) {
      const note = midiToNote(midi);
      const isBlack = note.accidental === 'sharp';
      const id = `${note.letter}${note.accidental === 'sharp' ? '#' : ''}${note.octave}`;
      const czechLabel = getCzechNoteName(note);
      
      keys.push({
        id,
        midi,
        type: isBlack ? 'black' : 'white',
        label: czechLabel,
        isMiddleC: midi === 60,
        isC: note.letter === 'C' && note.accidental === 'natural'
      });
    }
    return keys;
  }, []);

  return (
    <div className={cn("relative flex h-36 md:h-48 w-full max-w-5xl mx-auto overflow-x-auto pb-2 md:pb-4 px-2 no-scrollbar scroll-smooth", className)}>
      <div className="flex min-w-max">
        {allKeys.map((key) => {
          const isBlack = key.type === 'black';
          const isActive = activeNotes.includes(key.id);

          return (
            <button
              key={`${key.id}-${key.midi}`}
              onClick={() => onNoteClick?.(key.id)}
              className={cn(
                "relative flex-shrink-0 transition-all focus:outline-none touch-manipulation",
                isBlack 
                  ? "piano-key-black w-6 md:w-8 h-20 md:h-28 -mx-3 md:-mx-4 z-10" 
                  : "piano-key-white w-10 md:w-12 h-32 md:h-44 z-0",
                isActive && "active",
                !isBlack && key.isMiddleC && highlightMiddleC && "border-b-4 border-b-primary"
              )}
              aria-label={`Klávesa ${key.label}`}
            >
              {!isBlack && (
                <span className={cn(
                  "absolute bottom-1 md:bottom-2 left-0 right-0 text-[10px] md:text-[12px] font-black transition-opacity",
                  (key.isC || key.isMiddleC || isActive) 
                    ? "opacity-100 text-primary scale-110" 
                    : "text-muted-foreground/30 hover:opacity-100"
                )}>
                  {key.label}
                </span>
              )}
              {key.isC && !isBlack && (
                 <div className="absolute top-1 md:top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary/40" />
              )}
              {key.isMiddleC && highlightMiddleC && !isBlack && (
                 <div className="absolute top-1 md:top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
