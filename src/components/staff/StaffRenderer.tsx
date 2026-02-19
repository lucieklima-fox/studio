"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { MusicalNote, Clef } from '@/lib/music-logic';

interface StaffRendererProps {
  clef: Clef;
  note?: MusicalNote;
  className?: string;
}

// Staff lines are 20px apart. Line 5 (top) is at 30, Line 1 (bottom) is at 110.
const LINE_5_Y = 30;
const LINE_1_Y = 110;
const STEP_Y = 10; // Half a line distance

/**
 * Calculates the Y position of a note based on its letter and octave.
 */
function getNoteY(note: MusicalNote): number {
  const reference = note.clef === 'treble' 
    ? { letter: 'E', octave: 4, y: LINE_1_Y }
    : { letter: 'G', octave: 2, y: LINE_1_Y };

  const LETTER_TO_STEP: Record<string, number> = {
    'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6
  };

  const refAbsoluteStep = reference.octave * 7 + LETTER_TO_STEP[reference.letter];
  const targetAbsoluteStep = note.octave * 7 + LETTER_TO_STEP[note.letter];
  
  const stepDiff = targetAbsoluteStep - refAbsoluteStep;
  return reference.y - (stepDiff * STEP_Y);
}

export function StaffRenderer({ clef, note, className }: StaffRendererProps) {
  const noteY = note ? getNoteY(note) : null;
  const isSharp = note?.accidental === 'sharp';

  const STAFF_LINES = [30, 50, 70, 90, 110];

  return (
    <div className={cn("relative w-full h-48 flex items-center justify-center bg-white rounded-3xl shadow-inner border-4 border-primary/10 p-6", className)}>
      <svg viewBox="0 0 400 160" className="w-full h-full overflow-visible">
        {/* Clef Label */}
        <text x="10" y="20" fontSize="14" fontWeight="bold" fill="hsl(var(--primary))" className="uppercase tracking-widest font-body">
          {clef}
        </text>

        {/* Staff Lines */}
        {STAFF_LINES.map((y) => (
          <line key={y} x1="50" y1={y} x2="350" y2={y} stroke="#333" strokeWidth="2" />
        ))}

        {/* Vertical Bar Lines */}
        <line x1="50" y1="30" x2="50" y2="110" stroke="#333" strokeWidth="3" />
        <line x1="350" y1="30" x2="350" y2="110" stroke="#333" strokeWidth="3" />

        {/* Clef Icons (Simplified SVGs) */}
        {clef === 'treble' ? (
          <path d="M75 125 Q 95 105 75 85 T 75 45 Q 65 35 65 45 L 75 130" fill="none" stroke="#333" strokeWidth="4" strokeLinecap="round" />
        ) : (
          <g>
            <path d="M70 45 Q 100 45 100 70 Q 100 100 70 110" fill="none" stroke="#333" strokeWidth="5" strokeLinecap="round" />
            <circle cx="110" cy="60" r="3" fill="#333" />
            <circle cx="110" cy="80" r="3" fill="#333" />
          </g>
        )}

        {/* Note Representation */}
        {noteY !== null && (
          <g>
            {/* Ledger lines (C4 in treble, E2/C4 in bass, etc.) */}
            {noteY >= 120 && <line x1="175" y1="120" x2="225" y2="120" stroke="#333" strokeWidth="2" />}
            {noteY <= 20 && <line x1="175" y1="20" x2="225" y2="20" stroke="#333" strokeWidth="2" />}
            
            {/* Sharp Sign - Always displayed before the notehead */}
            {isSharp && (
              <text x="160" y={noteY + 8} fontSize="28" fontWeight="bold" fill="#333" className="font-body">♯</text>
            )}

            {/* The Note Head */}
            <ellipse 
              cx="200" 
              cy={noteY} 
              rx="13" 
              ry="9" 
              fill="black" 
              transform={`rotate(-20 200 ${noteY})`} 
            />
            
            {/* Note Stem */}
            <line 
              x1={noteY > 70 ? "187" : "213"} 
              y1={noteY} 
              x2={noteY > 70 ? "187" : "213"} 
              y2={noteY > 70 ? noteY - 50 : noteY + 50} 
              stroke="black" 
              strokeWidth="2.5" 
            />
          </g>
        )}
      </svg>
    </div>
  );
}
