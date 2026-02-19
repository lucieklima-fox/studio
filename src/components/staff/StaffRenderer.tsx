"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { MusicalNote, Clef, midiToStaffIndex, noteToMidi, getLedgerLines } from '@/lib/music-logic';

interface StaffRendererProps {
  clef: Clef;
  note?: MusicalNote;
  className?: string;
}

const STEP_Y = 10; // Vertical distance between a line and a space
const STAFF_BOTTOM_Y = 110; // Y coordinate for index 0 (E4 in treble, G2 in bass)

export function StaffRenderer({ clef, note, className }: StaffRendererProps) {
  const midi = note ? noteToMidi(note) : null;
  const staffIndex = (midi !== null) ? midiToStaffIndex(midi, clef) : null;
  const isSharp = note?.accidental === 'sharp';

  // Calculate absolute SVG Y coordinate based on staffIndex
  const getNoteY = (index: number) => {
    return STAFF_BOTTOM_Y - index * STEP_Y;
  };

  const noteY = staffIndex !== null ? getNoteY(staffIndex) : null;
  const ledgerIndices = staffIndex !== null ? getLedgerLines(staffIndex) : [];

  // Standard staff lines are at indices 0, 2, 4, 6, 8
  const STAFF_LINES = [0, 2, 4, 6, 8].map(idx => getNoteY(idx));

  return (
    <div className={cn("relative w-full h-56 flex items-center justify-center bg-white rounded-3xl shadow-inner border-4 border-primary/10 p-6", className)}>
      <svg viewBox="0 0 400 180" className="w-full h-full overflow-visible">
        {/* Clef Type Label */}
        <text x="10" y="20" fontSize="14" fontWeight="bold" fill="hsl(var(--primary))" className="uppercase tracking-widest font-body">
          {clef}
        </text>

        {/* Five Staff Lines */}
        {STAFF_LINES.map((y) => (
          <line key={y} x1="50" y1={y} x2="350" y2={y} stroke="#333" strokeWidth="2" />
        ))}

        {/* Vertical Bar Lines */}
        <line x1="50" y1={getNoteY(8)} x2="50" y2={getNoteY(0)} stroke="#333" strokeWidth="3" />
        <line x1="350" y1={getNoteY(8)} x2="350" y2={getNoteY(0)} stroke="#333" strokeWidth="3" />

        {/* Clef Icon Rendering */}
        {clef === 'treble' ? (
          <g transform="translate(60, 45) scale(0.85)">
            {/* Treble Clef path approximate */}
             <path 
                d="M17.3,87.6c-4.3-1.4-8-4.4-10.4-8.3c-2.1-3.3-3.1-7.1-3.1-11.1c0-10.4,6.7-19.4,16.7-22.5c1.4-0.4,2.9-0.7,4.4-0.7c2.1,0,4.1,0.5,5.9,1.4c1.1-6.1,2.1-12.1,3.1-18.2C30.4,18.8,26,10.1,21.5,1.4C21.2,0.8,21,0,21.8,0s1.2,0.8,1.5,1.4c3.8,7.3,7.6,14.6,11.4,21.9c1,1.9,1.6,4,1.8,6.2c0.7,7.2-0.8,14.5-2.2,21.7c-0.8,4.1-1.6,8.1-2.4,12.2c1.7,0.7,3.3,1.7,4.6,3c3.2,3.1,5.1,7.5,5.1,12.2c0,9.4-7.6,17-17,17c-2.4,0-4.6-0.5-6.7-1.4"
                fill="none" stroke="#333" strokeWidth="4" strokeLinecap="round"
             />
          </g>
        ) : (
          <g transform={`translate(60, ${getNoteY(6)})`}>
            {/* Bass Clef (F-clef) anchor is the F-line (index 6) */}
            <path 
              d="M0,0 c0,-15 35,-15 35,5 c0,15 -25,25 -35,35" 
              fill="none" 
              stroke="#333" 
              strokeWidth="5" 
              strokeLinecap="round" 
            />
            {/* Clef Head Dot on F-line */}
            <circle cx="0" cy="0" r="4" fill="#333" />
            {/* Clef Side Dots surrounding F-line (in the 3rd and 4th spaces) */}
            <circle cx="45" cy="-10" r="4" fill="#333" />
            <circle cx="45" cy="10" r="4" fill="#333" />
          </g>
        )}

        {/* Note Representation */}
        {noteY !== null && (
          <g>
            {/* Dynamic Ledger Lines */}
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
            
            {/* Sharp Sign (Accidental) */}
            {isSharp && (
              <text x="150" y={noteY + 12} fontSize="36" fontWeight="bold" fill="#333" className="font-body">♯</text>
            )}

            {/* Note Head (Ellipse) */}
            <ellipse 
              cx="200" 
              cy={noteY} 
              rx="13" 
              ry="9" 
              fill="black" 
              transform={`rotate(-20 200 ${noteY})`} 
            />
            
            {/* Note Stem - direction flips based on vertical staff position */}
            <line 
              x1={staffIndex !== null && staffIndex >= 4 ? "187" : "213"} 
              y1={noteY} 
              x2={staffIndex !== null && staffIndex >= 4 ? "187" : "213"} 
              y2={staffIndex !== null && staffIndex >= 4 ? noteY + 50 : noteY - 50} 
              stroke="black" 
              strokeWidth="2.5" 
            />
          </g>
        )}
      </svg>
    </div>
  );
}
