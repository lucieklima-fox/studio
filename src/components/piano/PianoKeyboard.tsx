"use client";

import React, { useMemo } from 'react';
import { PIANO_KEYS, OCTAVES } from '@/lib/music-constants';
import { cn } from '@/lib/utils';
import { midiToNote, noteToMidi } from '@/lib/music-logic';

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
    // Generate keys for octaves 2, 3, 4, 5
    // Filter to strictly stay within C2 (MIDI 36) to C5 (MIDI 72)
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
    ).filter(key => key.midi >= 36 && key.midi <= 72);
  }, []);

  return (
    <div className={cn("relative flex h-48 w-full max-w-4xl mx-auto overflow-x-auto pb-4 px-2", className)}>
      {allKeys.map((key) => {
        const isBlack = key.type === 'black';
        const isActive = activeNotes.includes(key.id);
        const isMiddleC = key.id === 'C4';

        return (
          <button
            key={key.id}
            onClick={() => onNoteClick?.(key.id)}
            className={cn(
              "relative flex-shrink-0 transition-all focus:outline-none",
              isBlack 
                ? "piano-key-black w-8 h-28 -mx-4 z-10" 
                : "piano-key-white w-12 h-44 z-0",
              isActive && "active",
              !isBlack && isMiddleC && highlightMiddleC && "border-b-4 border-b-primary"
            )}
            aria-label={`Key ${key.id}`}
          >
            {!isBlack && (
              <span className={cn(
                "absolute bottom-2 left-0 right-0 text-[10px] font-bold text-muted-foreground transition-opacity",
                isMiddleC && highlightMiddleC ? "opacity-100 text-primary" : "opacity-0 hover:opacity-100"
              )}>
                {key.id}
              </span>
            )}
            {isMiddleC && highlightMiddleC && !isBlack && (
               <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
