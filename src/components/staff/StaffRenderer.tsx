
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
 * StaffRenderer - Pedagogicky přesné a vizuálně klasické vykreslení notové osnovy.
 * Implementuje vysoce kvalitní vektorové klíče pro dosažení "tradičního" vzhledu.
 */
export function StaffRenderer({ clef, note, className, showName = false }: StaffRendererProps) {
  const midi = note ? noteToMidi(note) : null;
  const staffIndex = (midi !== null) ? midiToStaffIndex(midi, clef) : null;
  const isSharp = note?.accidental === 'sharp';

  // Standardní linky jsou na indexech 0, 2, 4, 6, 8 (vzhledem k dolní lince)
  const getNoteY = (index: number) => {
    return STAFF_CENTER_Y - (index - 4) * STEP_Y;
  };

  const noteY = staffIndex !== null ? getNoteY(staffIndex) : null;
  const ledgerIndices = staffIndex !== null ? getLedgerLines(staffIndex) : [];

  const STAFF_LINES = [0, 2, 4, 6, 8].map(idx => getNoteY(idx));

  // Dynamický viewBox pro zajištění viditelnosti vysokých/nízkých not
  let minY = 0;
  let height = 200;
  if (noteY !== null && noteY < 40) {
    minY = noteY - 50;
    height = 200 + Math.abs(minY) + 20;
  } else if (noteY !== null && noteY > 160) {
    height = noteY + 50;
  }

  return (
    <div className={cn("relative w-full h-64 flex flex-col items-center justify-center bg-white rounded-[2.5rem] shadow-sm border border-primary/10 p-4", className)}>
      <svg viewBox={`0 ${minY} 400 ${height}`} className="w-full h-full overflow-visible transition-all duration-300">
        {/* Pět hlavních linek osnovy */}
        {STAFF_LINES.map((y) => (
          <line key={y} x1="40" y1={y} x2="360" y2={y} stroke="#000" strokeWidth="2" strokeLinecap="butt" />
        ))}

        {/* Boční uzavření osnovy */}
        <line x1="40" y1={STAFF_LINES[4]} x2="40" y2={STAFF_LINES[0]} stroke="#000" strokeWidth="2.5" />

        {/* Klasický houslový klíč (Treble Clef) - Ručně optimalizovaná cesta pro klasický vzhled */}
        {clef === 'treble' ? (
          <g transform={`translate(45, ${getNoteY(2) - 58}) scale(0.075)`} fill="#000">
            <path d="M473.5,837.2c-29.2,0-54.7-10.4-76.5-31.2c-21.8-20.8-32.7-46.7-32.7-77.7c0-21,5.2-40.2,15.6-57.6 c10.4-17.4,24.8-31.6,43.2-42.6c18.4-11,39.6-16.5,63.6-16.5c24,0,44.9,5.7,62.7,17.1s30.4,28.6,37.8,51.6s11.1,48.1,11.1,75.3 c0,28.2-10.1,52.2-30.3,72.1S515.6,837.2,473.5,837.2z M473.5,808.2c22.8,0,41.9-8.1,57.3-24.3c15.4-16.2,23.1-36,23.1-59.4 c0-20.4-4-37.5-12-51.3c-8-13.8-19.1-23.9-33.3-30.3s-29.9-9.6-47.1-9.6c-24.4,0-44.5,7.9-60.3,23.7s-23.7,35.1-23.7,57.9 c0,22.8,7.9,42.4,23.7,58.8S441.2,808.2,473.5,808.2z M498.4,611.8c-142-23.4-213-88.7-213-195.9c0-39.2,14.6-73.4,43.8-102.6 c29.2-29.2,65.6-43.8,109.2-43.8c31.6,0,60.8,8.2,87.6,24.6s47.4,39.4,61.8,69c14.4,29.6,21.6,62,21.6,97.2 c0,38-7.9,73.1-23.7,105.3s-37.1,59.3-63.9,81.3S566.2,600.8,498.4,611.8z M446.9,584.2c56-17.6,101.4-50.6,136.2-99 c34.8-48.4,52.2-103.4,52.2-165c0-36.8-7.3-70.3-21.9-100.5s-35.3-54.3-62.1-72.3s-57.1-27-90.9-27c-36,0-66.2,12.2-90.6,36.6 c-24.4,24.4-36.6,52.9-36.6,85.5c0,42,14.8,76.6,44.4,103.8C407.2,573.5,446.9,584.2,446.9,584.2z M492.3,275.4l11.1-356 c-15.6-43.2-23.4-83.1-23.4-119.7c0-26,5-50.4,15-73.2s24.3-42.3,42.9-58.5s40.2-29,64.8-38.4s50.7-14.1,78.3-14.1 c38,0,72.4,9.6,103.2,28.8s55,45,72.6,77.4s26.4,68.2,26.4,107.4c0,52.8-11.4,104.2-34.2,154.2s-54.8,94.9-96,134.7 c-41.2,39.8-88.8,72.6-142.8,98.4c-54,25.8-110.8,42-170.4,48.6L492.3,275.4z M590.2,246c48-24.8,89.5-56.1,124.5-93.9 c35-37.8,61.9-80.1,80.7-126.9c18.8-46.8,28.2-94.8,28.2-144c0-33.6-7.3-64.8-21.9-93.6c-14.6-28.8-35.2-51.4-61.8-67.8 c-26.6-16.4-56.7-24.6-90.3-24.6c-24,0-45.3,5-63.9,15s-33.1,23.5-43.5,40.5s-15.6,35.9-15.6,56.7c0,28.8,6,59.4,18,91.8L590.2,246z" />
          </g>
        ) : (
          <g transform={`translate(45, ${getNoteY(6)})`} fill="#000">
            <path d="M0,0 c0,-15 35,-15 35,5 c0,15 -25,25 -35,35" stroke="#000" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <circle cx="0" cy="0" r="5" />
            <circle cx="45" cy="-10" r="4.5" />
            <circle cx="45" cy="10" r="4.5" />
          </g>
        )}

        {/* Vykreslení noty a pomocných linek */}
        {noteY !== null && (
          <g className="animate-in fade-in zoom-in duration-300">
            {/* Pomocné linky */}
            {ledgerIndices.map(idx => (
              <line 
                key={idx} 
                x1="175" 
                y1={getNoteY(idx)} 
                x2="225" 
                y2={getNoteY(idx)} 
                stroke="#000" 
                strokeWidth="2.2" 
                strokeLinecap="butt"
              />
            ))}
            
            {/* Posuvka (Křížek) */}
            {isSharp && (
              <text x="155" y={noteY + 11} fontSize="34" fontWeight="bold" fill="#000" style={{ fontFamily: 'serif' }}>♯</text>
            )}

            {/* Hlavička noty - Klasický skloněný ovál */}
            <ellipse 
              cx="200" 
              cy={noteY} 
              rx="13.5" 
              ry="9.5" 
              fill="#000" 
              transform={`rotate(-25 200 ${noteY})`} 
            />
            
            {/* Nožička noty */}
            <line 
              x1={staffIndex !== null && staffIndex >= 4 ? "186.5" : "213.5"} 
              y1={noteY} 
              x2={staffIndex !== null && staffIndex >= 4 ? "186.5" : "213.5"} 
              y2={staffIndex !== null && staffIndex >= 4 ? noteY + 58 : noteY - 58} 
              stroke="#000" 
              strokeWidth="2.2" 
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
      
      {showName && note && (
        <div className="mt-4 px-6 py-2 bg-primary/10 rounded-full text-2xl font-black text-primary animate-bounce shadow-sm">
          {note.letter}{note.accidental === 'sharp' ? '#' : ''}{note.octave}
        </div>
      )}
    </div>
  );
}
