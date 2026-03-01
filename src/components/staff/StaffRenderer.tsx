"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { MusicalNote, Clef, midiToStaffIndex, noteToMidi, getLedgerLines, getCzechNoteName, getCzechOctaveLabel } from '@/lib/music-logic';

interface StaffRendererProps {
  clef: Clef;
  note?: MusicalNote;
  className?: string;
  showName?: boolean;
}

const STEP_Y = 10;
const STAFF_CENTER_Y = 120;

export function StaffRenderer({ clef, note, className, showName = false }: StaffRendererProps) {
  const midi = note ? noteToMidi(note) : null;
  const staffIndex = (midi !== null) ? midiToStaffIndex(midi, clef) : null;
  const isSharp = note?.accidental === 'sharp';

  const getNoteY = (index: number) => {
    return STAFF_CENTER_Y - (index - 4) * STEP_Y;
  };

  const noteY = staffIndex !== null ? getNoteY(staffIndex) : null;
  const ledgerIndices = staffIndex !== null ? getLedgerLines(staffIndex) : [];

  const STAFF_LINES = [0, 2, 4, 6, 8].map(idx => getNoteY(idx));

  let minY = 20;
  let height = 200;
  if (noteY !== null) {
    if (noteY < 60) {
      minY = Math.min(0, noteY - 60);
      height = 240 + Math.abs(minY);
    } else if (noteY > 180) {
      height = noteY + 80;
    }
  }

  return (
    <div className={cn("relative w-full h-80 flex flex-col items-center justify-center bg-white rounded-[2.5rem] shadow-xl border-2 border-primary/10 p-6 overflow-hidden", className)}>
      <svg viewBox={`0 ${minY} 400 ${height}`} className="w-full h-full overflow-visible">
        {STAFF_LINES.map((y) => (
          <line key={y} x1="40" y1={y} x2="360" y2={y} stroke="#111111" strokeWidth="2" strokeLinecap="butt" />
        ))}

        <line x1="40" y1={STAFF_LINES[4]} x2="40" y2={STAFF_LINES[0]} stroke="#111111" strokeWidth="2.5" />

        {clef === 'treble' ? (
          <g transform={`translate(42, ${getNoteY(2) - 66}) scale(0.12)`} fill="#111111">
            <path d="M124.7,465.7c-26.6-8.7-48.4-26.3-61.1-49.3c-10.4-18.8-14.7-41.2-12.8-66.2c3.2-43.1,28.7-87.3,64.8-112.5 c15.2-10.6,33.5-17.7,51.5-20.1c5.2-0.7,5.5-0.9,4.4-3.3c-5.8-13.3-11.4-28.7-14.9-40.4c-9.1-30.3-13.6-61.9-13.2-93.5 c0.4-29.2,5.2-53.1,14.6-73.4c12.2-26.4,32.3-46.1,58.7-57.5c14.6-6.4,26.4-8.8,42.4-8.7c26.7,0.2,49.2,8.8,69,26.3 c13.4,11.8,22.4,25.9,28,43.4c3,9.4,3.7,14.2,3.7,27.1c0,13.7-0.7,18.4-4.5,30c-11.9,35.9-38.6,71.4-74.9,99.5 c-20.7,16-47.5,32.7-71,44.2c-2.3,1.1-4.2,2.2-4.2,2.4c0,0.2,23.3,66.1,51.8,146.5c11.6,32.7,21.5,61,22.1,62.8 c0.7,2.2,0.9,13.8,0.4,21.1c-1.8,26.5-12,50.8-29.5,70.6c-18.4,20.8-44.1,34.1-73.1,37.8C159.2,469.7,140.4,470.8,124.7,465.7z M204.4,424.4c17.1-4.1,30.3-13.8,40.1-29.4c7.4-11.8,11.3-26.4,11.3-42c0-23.7-11.6-43.5-35-59.5c-7.9-5.4-8.5-6.5-1.7-27.1 c23.2-70.5,32.6-104.3,37.8-135.2c3.3-19.4,3.6-32.9,1-49c-4.4-27.4-18.1-47.5-38.3-56.5c-8-3.6-13.1-4.5-22.1-3.9 c-16,1-30.8,9-41.1,22.3c-11.7,15.1-17.7,35-17.7,59c0,29.8,11.1,71.7,26.8,101.4c3.5,6.6,6.4,12.3,6.5,12.6 c0.1,0.3-2.6,1.4-6,2.4c-35.1,10.6-62.8,32.4-81.1,63.9c-14.3,24.6-19,53-13.3,80.7c3.4,16.7,10,31.7,19.2,43.5 c15.2,19.5,36.9,31.8,61,34.5C168.1,430.3,189.6,427.9,204.4,424.4z M176,336.5c-15.3-21.4-22.3-49.3-19-75 c1.5-11.7,5.5-23.2,11.3-32.8c11.2-18.4,28.6-29.8,47.9-31.5c4.7-0.4,8.8-0.2,9,0.3c0.4,1-31.9,98.6-43.3,130.5 c-3.1,8.7-5.8,16.1-6.1,16.5c-0.2,0.4-2,0-3.9-0.9C170.1,342.7,173,340.6,176,336.5z"/>
          </g>
        ) : (
          <g transform={`translate(46, ${getNoteY(6)}) scale(1.1)`} fill="#111111">
            <path d="M0,0 c0,-18 42,-18 42,6 c0,18 -30,30 -42,42" stroke="#111111" strokeWidth="7" fill="none" strokeLinecap="round" />
            <circle cx="2" cy="0" r="8" />
            <circle cx="56" cy="-12" r="6" />
            <circle cx="56" cy="12" r="6" />
          </g>
        )}

        {noteY !== null && (
          <g className="animate-in fade-in zoom-in duration-300">
            {ledgerIndices.map(idx => (
              <line 
                key={idx} 
                x1="172" 
                y1={getNoteY(idx)} 
                x2="228" 
                y2={getNoteY(idx)} 
                stroke="#111111" 
                strokeWidth="2.5" 
                strokeLinecap="butt"
              />
            ))}
            
            {isSharp && (
              <text 
                x="150" 
                y={noteY + 14} 
                fontSize="42" 
                fontWeight="600" 
                fill="#111111" 
                style={{ fontFamily: 'serif', pointerEvents: 'none' }}
              >
                ♯
              </text>
            )}

            <g transform={`rotate(-28 200 ${noteY})`}>
              <ellipse 
                cx="200" 
                cy={noteY} 
                rx="15" 
                ry="11" 
                fill="#111111" 
              />
            </g>
            
            <line 
              x1={staffIndex !== null && staffIndex >= 4 ? "185.5" : "214.5"} 
              y1={noteY} 
              x2={staffIndex !== null && staffIndex >= 4 ? "185.5" : "214.5"} 
              y2={staffIndex !== null && staffIndex >= 4 ? noteY + 70 : noteY - 70} 
              stroke="#111111" 
              strokeWidth="2.5" 
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
      
      {showName && note && (
        <div className="mt-4 flex flex-col items-center gap-1 animate-in slide-in-from-bottom-2">
          <div className="px-6 py-1 bg-accent/10 text-accent rounded-full text-sm font-bold uppercase tracking-wider">
            {getCzechOctaveLabel(note.octave)}
          </div>
          <div className="px-10 py-3 bg-primary text-white rounded-full text-5xl font-black shadow-lg border-4 border-white">
            {getCzechNoteName(note)}
          </div>
        </div>
      )}
    </div>
  );
}
