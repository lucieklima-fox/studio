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
    <div className={cn("relative flex h-40 md:h-56 w-full max-w-5xl mx-auto overflow-x-auto pb-4 px-2 no-scrollbar scroll-smooth bg-gray-100/50 rounded-xl", className)}>
      <div className="flex min-w-max relative pt-2">
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
                  ? "bg-gray-900 w-6 md:w-8 h-24 md:h-32 -mx-3 md:-mx-4 z-10 rounded-b-sm shadow-[inset_0_-2px_4px_rgba(255,255,255,0.2),0_4px_6px_rgba(0,0,0,0.5)] active:h-[calc(inherit-2px)] active:brightness-125" 
                  : "bg-white w-10 md:w-12 h-36 md:h-48 z-0 border border-gray-300 rounded-b-md shadow-[inset_0_-4px_8px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.1)] active:bg-gray-50 active:pt-1",
                isActive && (isBlack ? "bg-accent shadow-inner scale-95" : "bg-primary/20 border-primary shadow-inner"),
                !isBlack && key.isMiddleC && highlightMiddleC && "border-b-8 border-b-primary"
              )}
              aria-label={`Klávesa ${key.label}`}
            >
              {!isBlack && (
                <span className={cn(
                  "absolute bottom-2 left-0 right-0 text-[10px] md:text-[13px] font-black transition-opacity",
                  (key.isC || key.isMiddleC || isActive) 
                    ? "opacity-100 text-primary scale-110" 
                    : "text-muted-foreground/20"
                )}>
                  {key.label}
                </span>
              )}
              {key.isC && !isBlack && (
                 <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary/30" />
              )}
              {key.isMiddleC && highlightMiddleC && !isBlack && (
                 <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
