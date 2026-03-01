"use client";

import React, { useMemo } from 'react';
import { PIANO_KEYS, OCTAVES } from '@/lib/music-constants';
import { cn } from '@/lib/utils';
import { noteToMidi } from '@/lib/music-logic';

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
    return OCTAVES.flatMap(octave => 
      PIANO_KEYS.map(key => {
        const id = `${key.name}${octave}`;
        const midi = noteToMidi({
          letter: key.name.replace('#', '') as any,
          octave: octave,
          accidental: key.name.includes('#') ? 'sharp' : 'natural',
          clef: 'treble'
        });
        return {
          ...key,
          octave,
          id,
          midi
        };
      })
    ).filter(key => key.midi >= 36 && key.midi <= 84);
  }, []);

  return (
    <div className={cn("relative flex h-36 md:h-48 w-full max-w-4xl mx-auto overflow-x-auto pb-2 md:pb-4 px-2 no-scrollbar scroll-smooth", className)}>
      <div className="flex min-w-max">
        {allKeys.map((key) => {
          const isBlack = key.type === 'black';
          const isActive = activeNotes.includes(key.id);
          const isMiddleC = key.id === 'C4';

          return (
            <button
              key={key.id}
              onClick={() => onNoteClick?.(key.id)}
              className={cn(
                "relative flex-shrink-0 transition-all focus:outline-none touch-manipulation",
                isBlack 
                  ? "piano-key-black w-6 md:w-8 h-20 md:h-28 -mx-3 md:-mx-4 z-10" 
                  : "piano-key-white w-10 md:w-12 h-32 md:h-44 z-0",
                isActive && "active",
                !isBlack && isMiddleC && highlightMiddleC && "border-b-2 md:border-b-4 border-b-primary"
              )}
              aria-label={`Key ${key.id}`}
            >
              {!isBlack && (
                <span className={cn(
                  "absolute bottom-1 md:bottom-2 left-0 right-0 text-[8px] md:text-[10px] font-bold text-muted-foreground transition-opacity",
                  isMiddleC && highlightMiddleC ? "opacity-100 text-primary" : "opacity-0 hover:opacity-100"
                )}>
                  {key.id}
                </span>
              )}
              {isMiddleC && highlightMiddleC && !isBlack && (
                 <div className="absolute top-1 md:top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
