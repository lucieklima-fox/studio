"use client";

import React from "react";

export type ClefType = "treble" | "bass";

export interface NoteItem {
  id: string;
  base: string;       // "c" | "d" | "e" | "f" | "g" | "a" | "h"
  label: string;      // Český název (např. "c1", "g1", "F")
  step: number;       // Poloha na osnově (2 = spodní linka osnovy)
  freq: number;       // Frekvence v Hz
  octaveName: string; // Název oktávy
}

export const NOTES_BY_CLEF: Record<ClefType, NoteItem[]> = {
  treble: [
    { id: "t-c1", base: "c", label: "c1", step: 0, freq: 261.63, octaveName: "Jednočárkovaná" },
    { id: "t-d1", base: "d", label: "d1", step: 1, freq: 293.66, octaveName: "Jednočárkovaná" },
    { id: "t-e1", base: "e", label: "e1", step: 2, freq: 329.63, octaveName: "Jednočárkovaná" },
    { id: "t-f1", base: "f", label: "f1", step: 3, freq: 349.23, octaveName: "Jednočárkovaná" },
    { id: "t-g1", base: "g", label: "g1", step: 4, freq: 392.00, octaveName: "Jednočárkovaná" },
    { id: "t-a1", base: "a", label: "a1", step: 5, freq: 440.00, octaveName: "Jednočárkovaná" },
    { id: "t-h1", base: "h", label: "h1", step: 6, freq: 493.88, octaveName: "Jednočárkovaná" },
    { id: "t-c2", base: "c", label: "c2", step: 7, freq: 523.25, octaveName: "Dvoučárkovaná" },
    { id: "t-d2", base: "d", label: "d2", step: 8, freq: 587.33, octaveName: "Dvoučárkovaná" },
    { id: "t-e2", base: "e", label: "e2", step: 9, freq: 659.25, octaveName: "Dvoučárkovaná" },
    { id: "t-f2", base: "f", label: "f2", step: 10, freq: 698.46, octaveName: "Dvoučárkovaná" },
    { id: "t-g2", base: "g", label: "g2", step: 11, freq: 783.99, octaveName: "Dvoučárkovaná" },
  ],
  bass: [
    { id: "b-F", base: "f", label: "F", step: 1, freq: 87.31, octaveName: "Velká" },
    { id: "b-G", base: "g", label: "G", step: 2, freq: 98.00, octaveName: "Velká" },
    { id: "b-A", base: "a", label: "A", step: 3, freq: 110.00, octaveName: "Velká" },
    { id: "b-H", base: "h", label: "H", step: 4, freq: 123.47, octaveName: "Velká" },
    { id: "b-c", base: "c", label: "c", step: 5, freq: 130.81, octaveName: "Malá" },
    { id: "b-d", base: "d", label: "d", step: 6, freq: 146.83, octaveName: "Malá" },
    { id: "b-e", base: "e", label: "e", step: 7, freq: 164.81, octaveName: "Malá" },
    { id: "b-f", base: "f", label: "f", step: 8, freq: 174.61, octaveName: "Malá" },
    { id: "b-g", base: "g", label: "g", step: 9, freq: 196.00, octaveName: "Malá" },
    { id: "b-a", base: "a", label: "a", step: 10, freq: 220.00, octaveName: "Malá" },
    { id: "b-h", base: "h", label: "h", step: 11, freq: 246.94, octaveName: "Malá" },
    { id: "b-c1", base: "c", label: "c1", step: 12, freq: 261.63, octaveName: "Jednočárkovaná" },
  ],
};

interface StaffProps {
  clef: ClefType;
  activeNote: NoteItem;
  showLabel: boolean;
  status?: "idle" | "correct" | "wrong";
}

export const Staff: React.FC<StaffProps> = ({
  clef,
  activeNote,
  showLabel,
  status = "idle",
}) => {
  const lineSpacing = 15;
  const halfStep = lineSpacing / 2;
  const bottomLineY = 120; // Spodní linka osnovy (step = 2)
  const noteY = bottomLineY - (activeNote.step - 2) * halfStep;
  const noteX = 205;

  const noteColor =
    status === "correct"
      ? "#16a34a"
      : status === "wrong"
      ? "#dc2626"
      : "#0f172a";

  const borderClass =
    status === "correct"
      ? "border-green-600"
      : status === "wrong"
      ? "border-red-600"
      : "border-slate-200";

  return (
    <div
      className={`w-full bg-white rounded-2xl border-2 ${borderClass} p-3 shadow-sm transition-colors`}
    >
      <svg
        viewBox="0 0 320 180"
        className="w-full max-h-48 select-none"
        role="img"
        aria-label={`Notová osnova – ${showLabel ? activeNote.label : "hádání tónu"}`}
      >
        {/* 5 linek notové osnovy */}
        {[0, 1, 2, 3, 4].map((lineIndex) => {
          const y = bottomLineY - lineIndex * lineSpacing;
          return (
            <line
              key={lineIndex}
              x1="25"
              y1={y}
              x2="295"
              y2={y}
              stroke="#64748b"
              strokeWidth="1.6"
            />
          );
        })}

        {/* Přesný houslový klíč (spirála ukotvená přímo na 2. lince = g1) nebo basový klíč */}
        {clef === "treble" ? (
          <g transform="translate(42, 34) scale(0.95)">
            <path
              d="M26 95 C15 95, 8 86, 8 76 C8 63, 20 54, 32 54 C44 54, 52 63, 52 75 C52 88, 41 97, 28 97 C19 97, 13 91, 13 83 C13 76, 19 71, 26 71 C32 71, 36 75, 36 80 C36 84, 33 87, 29 87 C26 87, 24 85, 24 82"
              fill="none"
              stroke="#0f172a"
              strokeWidth="3.6"
              strokeLinecap="round"
            />
            <path
              d="M27 112 C27 122, 20 128, 13 128 C7 128, 3 123, 3 118 C3 113, 7 109, 12 109 C16 109, 19 112, 19 116 C19 119, 17 121, 14 121 M27 112 L27 10 C27 2, 34 -4, 39 2 C44 8, 37 26, 20 43 C9 54, 5 64, 5 75"
              fill="none"
              stroke="#0f172a"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ) : (
          <g transform="translate(46, 60)">
            <circle cx="12" cy="15" r="5.5" fill="#0f172a" />
            <path
              d="M12 15 C24 5, 42 12, 42 30 C42 46, 26 56, 10 62"
              fill="none"
              stroke="#0f172a"
              strokeWidth="4.2"
              strokeLinecap="round"
            />
            <circle cx="51" cy="8" r="2.8" fill="#0f172a" />
            <circle cx="51" cy="23" r="2.8" fill="#0f172a" />
          </g>
        )}

        {/* Pomocná linka dole (c1 v houslovém klíči) */}
        {activeNote.step <= 0 && (
          <line
            x1={noteX - 18}
            y1={bottomLineY + lineSpacing}
            x2={noteX + 18}
            y2={bottomLineY + lineSpacing}
            stroke="#334155"
            strokeWidth="2"
          />
        )}

        {/* Pomocná linka nahoře (c1 v basovém klíči) */}
        {activeNote.step >= 12 && (
          <line
            x1={noteX - 18}
            y1={bottomLineY - 5 * lineSpacing}
            x2={noteX + 18}
            y2={bottomLineY - 5 * lineSpacing}
            stroke="#334155"
            strokeWidth="2"
          />
        )}

        {/* Hlavička noty */}
        <ellipse
          cx={noteX}
          cy={noteY}
          rx="9"
          ry="6.5"
          transform={`rotate(-18 ${noteX} ${noteY})`}
          fill={noteColor}
        />

        {/* Nožička noty */}
        {activeNote.step < 6 ? (
          <line
            x1={noteX + 8}
            y1={noteY}
            x2={noteX + 8}
            y2={noteY - 40}
            stroke={noteColor}
            strokeWidth="2.4"
          />
        ) : (
          <line
            x1={noteX - 8}
            y1={noteY}
            x2={noteX - 8}
            y2={noteY + 40}
            stroke={noteColor}
            strokeWidth="2.4"
          />
        )}
      </svg>

      <div className="h-7 flex items-center justify-center font-bold text-lg text-slate-900">
        {showLabel ? (
          <span>
            {activeNote.label}{" "}
            <span className="text-sm font-normal text-slate-500">
              ({activeNote.octaveName})
            </span>
          </span>
        ) : (
          <span className="text-sm font-medium text-slate-400">
            Jaký je to tón?
          </span>
        )}
      </div>
    </div>
  );
};
