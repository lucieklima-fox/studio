
"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { MusicalNote, Clef, midiToStaffIndex, noteToMidi, getLedgerLines } from '@/lib/music-logic';

interface StaffRendererProps {
  clef: Clef;
  note?: MusicalNote;
  className?: string;
  showName?: boolean;
}

const STEP_Y = 10; // Vertikální vzdálenost mezi linkou a mezerou
const STAFF_CENTER_Y = 100; // Y souřadnice pro střed osnovy (třetí linka)

/**
 * StaffRenderer - Pedagogicky přesné vykreslení notové osnovy.
 * Podporuje široký rozsah tónů od C2 do C7 s dynamickými pomocnými linkami.
 */
export function StaffRenderer({ clef, note, className, showName = false }: StaffRendererProps) {
  const midi = note ? noteToMidi(note) : null;
  const staffIndex = (midi !== null) ? midiToStaffIndex(midi, clef) : null;
  const isSharp = note?.accidental === 'sharp';

  // Standardní linky jsou na indexech 0, 2, 4, 6, 8 (vzhledem k dolní lince)
  // Pro výpočet Y souřadnice: Index 4 (prostřední linka) bude na STAFF_CENTER_Y
  const getNoteY = (index: number) => {
    return STAFF_CENTER_Y - (index - 4) * STEP_Y;
  };

  const noteY = staffIndex !== null ? getNoteY(staffIndex) : null;
  const ledgerIndices = staffIndex !== null ? getLedgerLines(staffIndex) : [];

  const STAFF_LINES = [0, 2, 4, 6, 8].map(idx => getNoteY(idx));

  // Dynamický viewBox pro zajištění viditelnosti vysokých/nízkých not
  // Standardně 0-200, ale pro extrémní noty (C7) musíme posunout nahoru
  let minY = 0;
  let height = 200;
  if (noteY !== null && noteY < 40) {
    minY = noteY - 40;
    height = 200 + Math.abs(minY);
  }

  return (
    <div className={cn("relative w-full h-64 flex flex-col items-center justify-center bg-white rounded-[2rem] shadow-inner border-2 border-primary/5 p-4", className)}>
      <svg viewBox={`0 ${minY} 400 ${height}`} className="w-full h-full overflow-visible transition-all duration-500">
        {/* Označení klíče */}
        <text x="20" y={minY + 25} fontSize="12" fontWeight="800" fill="hsl(var(--primary))" className="uppercase tracking-[0.2em] opacity-40">
          {clef} Clef
        </text>

        {/* Pět hlavních linek osnovy */}
        {STAFF_LINES.map((y) => (
          <line key={y} x1="50" y1={y} x2="350" y2={y} stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
        ))}

        {/* Boční uzavření osnovy */}
        <line x1="50" y1={STAFF_LINES[4]} x2="50" y2={STAFF_LINES[0]} stroke="#1a1a1a" strokeWidth="2" />
        <line x1="350" y1={STAFF_LINES[4]} x2="350" y2={STAFF_LINES[0]} stroke="#1a1a1a" strokeWidth="2" />

        {/* Vykreslení klíče */}
        {clef === 'treble' ? (
          <g transform={`translate(55, ${getNoteY(2) - 45}) scale(0.7)`} fill="#1a1a1a">
            <path d="M17.3,87.6c-4.3-1.4-8-4.4-10.4-8.3c-2.1-3.3-3.1-7.1-3.1-11.1c0-10.4,6.7-19.4,16.7-22.5c1.4-0.4,2.9-0.7,4.4-0.7c2.1,0,4.1,0.5,5.9,1.4c1.1-6.1,2.1-12.1,3.1-18.2C30.4,18.8,26,10.1,21.5,1.4C21.2,0.8,21,0,21.8,0s1.2,0.8,1.5,1.4c3.8,7.3,7.6,14.6,11.4,21.9c1,1.9,1.6,4,1.8,6.2c0.7,7.2-0.8,14.5-2.2,21.7c-0.8,4.1-1.6,8.1-2.4,12.2c1.7,0.7,3.3,1.7,4.6,3c3.2,3.1,5.1,7.5,5.1,12.2c0,9.4-7.6,17-17,17c-2.4,0-4.6-0.5-6.7-1.4" />
            <circle cx="21" cy="95" r="4" />
          </g>
        ) : (
          <g transform={`translate(60, ${getNoteY(6)})`} fill="none" stroke="#1a1a1a" strokeWidth="4">
            <path d="M0,0 c0,-15 35,-15 35,5 c0,15 -25,25 -35,35" strokeLinecap="round" />
            <circle cx="0" cy="0" r="4" fill="#1a1a1a" stroke="none" />
            <circle cx="45" cy="-10" r="3.5" fill="#1a1a1a" stroke="none" />
            <circle cx="45" cy="10" r="3.5" fill="#1a1a1a" stroke="none" />
          </g>
        )}

        {/* Vykreslení noty */}
        {noteY !== null && (
          <g className="animate-in fade-in zoom-in duration-300">
            {/* Pomocné linky (Ledger Lines) */}
            {ledgerIndices.map(idx => (
              <line 
                key={idx} 
                x1="170" 
                y1={getNoteY(idx)} 
                x2="230" 
                y2={getNoteY(idx)} 
                stroke="#1a1a1a" 
                strokeWidth="1.5" 
              />
            ))}
            
            {/* Křížek (Sharp) */}
            {isSharp && (
              <text x="145" y={noteY + 12} fontSize="32" fontWeight="bold" fill="#1a1a1a" className="font-serif">♯</text>
            )}

            {/* Hlavička noty */}
            <ellipse 
              cx="200" 
              cy={noteY} 
              rx="13" 
              ry="9.5" 
              fill="#1a1a1a" 
              transform={`rotate(-22 200 ${noteY})`} 
            />
            
            {/* Nožička noty - směr se mění podle pozice (nad/pod 3. linkou) */}
            <line 
              x1={staffIndex !== null && staffIndex >= 4 ? "187.5" : "212.5"} 
              y1={noteY} 
              x2={staffIndex !== null && staffIndex >= 4 ? "187.5" : "212.5"} 
              y2={staffIndex !== null && staffIndex >= 4 ? noteY + 55 : noteY - 55} 
              stroke="#1a1a1a" 
              strokeWidth="2" 
            />
          </g>
        )}
      </svg>
      
      {showName && note && (
        <div className="mt-2 text-2xl font-black text-primary animate-bounce">
          {note.letter}{note.accidental === 'sharp' ? '#' : ''}{note.octave}
        </div>
      )}
    </div>
  );
}
