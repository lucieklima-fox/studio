"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { MusicalNote, Clef, midiToStaffIndex, noteToMidi, getLedgerLines } from '@/lib/music-logic';

interface StaffRendererProps {
  clef: Clef;
  note?: MusicalNote;
  className?: string;
}

const STEP_Y = 10; // Distance between a line and a space
const STAFF_BOTTOM_Y = 110; // Y coordinate for index 0 (E4 in treble, G2 in bass)

export function StaffRenderer({ clef, note, className }: StaffRendererProps) {
  const midi = note ? noteToMidi(note) : null;
  const staffIndex = midi !== null ? midiToStaffIndex(midi, clef) : null;
  const isSharp = note?.accidental === 'sharp';

  // Calculate Y based on staffIndex (0 = bottom line)
  const getNoteY = (index: number) => {
    return STAFF_BOTTOM_Y - index * STEP_Y;
  };

  const noteY = staffIndex !== null ? getNoteY(staffIndex) : null;
  const ledgerIndices = staffIndex !== null ? getLedgerLines(staffIndex) : [];

  // Static staff lines are at index 0, 2, 4, 6, 8
  const STAFF_LINES = [0, 2, 4, 6, 8].map(idx => getNoteY(idx));

  return (
    <div className={cn("relative w-full h-56 flex items-center justify-center bg-white rounded-3xl shadow-inner border-4 border-primary/10 p-6", className)}>
      <svg viewBox="0 0 400 180" className="w-full h-full overflow-visible">
        {/* Clef Label */}
        <text x="10" y="20" fontSize="14" fontWeight="bold" fill="hsl(var(--primary))" className="uppercase tracking-widest font-body">
          {clef}
        </text>

        {/* Staff Lines */}
        {STAFF_LINES.map((y) => (
          <line key={y} x1="50" y1={y} x2="350" y2={y} stroke="#333" strokeWidth="2" />
        ))}

        {/* Vertical Bar Lines */}
        <line x1="50" y1={getNoteY(8)} x2="50" y2={getNoteY(0)} stroke="#333" strokeWidth="3" />
        <line x1="350" y1={getNoteY(8)} x2="350" y2={getNoteY(0)} stroke="#333" strokeWidth="3" />

        {/* Clef Icons */}
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
            {/* Ledger lines */}
            {ledgerIndices.map(idx => (
              <line 
                key={idx} 
                x1="175" 
                y1={getNoteY(idx)} 
                x2="225" 
                y2={getNoteY(idx)} 
                stroke="#333" 
                strokeWidth="2" 
              />
            ))}
            
            {/* Sharp Sign */}
            {isSharp && (
              <text x="160" y={noteY + 8} fontSize="28" fontWeight="bold" fill="#333" className="font-body">♯</text>
            )}

            {/* Note Head */}
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
              x1={staffIndex !== null && staffIndex > 4 ? "187" : "213"} 
              y1={noteY} 
              x2={staffIndex !== null && staffIndex > 4 ? "187" : "213"} 
              y2={staffIndex !== null && staffIndex > 4 ? noteY + 50 : noteY - 50} 
              stroke="black" 
              strokeWidth="2.5" 
            />
          </g>
        )}
      </svg>
    </div>
  );
}
