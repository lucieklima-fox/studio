"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface StaffRendererProps {
  clef: 'treble' | 'bass';
  note?: string; // e.g., "C4"
  className?: string;
}

const noteToYMap: Record<string, number> = {
  // Treble
  "G5": 10, "F5": 20, "E5": 30, "D5": 40, "C5": 50, "B4": 60, "A4": 70, "G4": 80, "F4": 90, "E4": 100, "D4": 110, "C4": 120,
  // Bass
  "E3": 10, "D3": 20, "C3": 30, "B2": 40, "A2": 50, "G2": 60, "F2": 70, "E2": 80, "D2": 90, "C2": 100, "B1": 110, "A1": 120,
};

// Simplified Y positions relative to staff lines (spaced 20px apart)
// Line 1: 30, Line 2: 50, Line 3: 70, Line 4: 90, Line 5: 110
const STAFF_LINES = [30, 50, 70, 90, 110];

export function StaffRenderer({ clef, note, className }: StaffRendererProps) {
  const noteY = note ? noteToYMap[note] : null;
  const isSharp = note?.includes('#');

  return (
    <div className={cn("relative w-full h-40 flex items-center justify-center bg-white rounded-xl shadow-inner border-2 border-primary/20 p-4", className)}>
      <svg viewBox="0 0 400 150" className="w-full h-full">
        {/* Clef Label */}
        <text x="10" y="20" fontSize="12" fontWeight="bold" fill="#666" className="uppercase tracking-widest">
          {clef} clef
        </text>

        {/* Staff Lines */}
        {STAFF_LINES.map((y) => (
          <line key={y} x1="50" y1={y} x2="350" y2={y} stroke="black" strokeWidth="1.5" />
        ))}

        {/* Vertical Bar Lines */}
        <line x1="50" y1="30" x2="50" y2="110" stroke="black" strokeWidth="2" />
        <line x1="350" y1="30" x2="350" y2="110" stroke="black" strokeWidth="2" />

        {/* Clef Icons (Simplified placeholders) */}
        {clef === 'treble' ? (
          <path d="M70 120 Q 90 100 70 80 T 70 40" fill="none" stroke="black" strokeWidth="3" />
        ) : (
          <path d="M70 40 Q 90 40 90 60 T 70 80" fill="none" stroke="black" strokeWidth="3" />
        )}

        {/* Note Representation */}
        {noteY !== null && (
          <g>
            {/* Ledger lines if needed */}
            {noteY >= 120 && <line x1="180" y1="120" x2="220" y2="120" stroke="black" strokeWidth="1.5" />}
            {noteY <= 20 && <line x1="180" y1="20" x2="220" y2="20" stroke="black" strokeWidth="1.5" />}
            
            {/* The Note Head */}
            <ellipse 
              cx="200" 
              cy={noteY} 
              rx="12" 
              ry="8" 
              fill="black" 
              transform={`rotate(-20 200 ${noteY})`} 
            />
            
            {/* Note Stem (Simplified) */}
            <line 
              x1={noteY > 70 ? "188" : "212"} 
              y1={noteY} 
              x2={noteY > 70 ? "188" : "212"} 
              y2={noteY > 70 ? noteY - 45 : noteY + 45} 
              stroke="black" 
              strokeWidth="2" 
            />

            {/* Sharp Sign */}
            {isSharp && (
              <text x="165" y={noteY + 5} fontSize="20" fontWeight="bold">#</text>
            )}
          </g>
        )}
      </svg>
    </div>
  );
}
