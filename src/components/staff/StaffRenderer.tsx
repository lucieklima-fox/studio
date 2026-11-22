"use client";

import React from "react";

export type ClefType = "treble" | "bass";
export type AccidentalType = "natural" | "sharp" | "flat";
export type FilterMode = "natural" | "sharps" | "flats" | "all";

export interface NoteItem {
  id: string;
  base: string;        // "c" | "d" | "e" | "f" | "g" | "a" | "h"
  accidental: AccidentalType;
  pitchClass: string;  // např. "c", "cis", "des", "b"
  label: string;       // Český název (např. "cis1", "es1", "b")
  step: number;        // Poloha na osnově (2 = spodní linka osnovy)
  freq: number;        // Frekvence v Hz
  octaveName: string;  // Název oktávy
}

// Barevné kódování tónů (usnadňuje orientaci a učení)
export const NOTE_COLORS: Record<string, string> = {
  c: "#ef4444", // červená
  d: "#f97316", // oranžová
  e: "#eab308", // žlutá
  f: "#22c55e", // zelená
  g: "#06b6d4", // tyrkysová
  a: "#3b82f6", // modrá
  h: "#a855f7", // fialová
};

export const NOTES_BY_CLEF: Record<ClefType, NoteItem[]> = {
  treble: [
    // Základní tóny c1 - g2
    { id: "t-c1", base: "c", accidental: "natural", pitchClass: "c", label: "c1", step: 0, freq: 261.63, octaveName: "Jednočárkovaná" },
    { id: "t-cis1", base: "c", accidental: "sharp", pitchClass: "cis", label: "cis1", step: 0, freq: 277.18, octaveName: "Jednočárkovaná" },
    { id: "t-des1", base: "d", accidental: "flat", pitchClass: "des", label: "des1", step: 1, freq: 277.18, octaveName: "Jednočárkovaná" },
    { id: "t-d1", base: "d", accidental: "natural", pitchClass: "d", label: "d1", step: 1, freq: 293.66, octaveName: "Jednočárkovaná" },
    { id: "t-dis1", base: "d", accidental: "sharp", pitchClass: "dis", label: "dis1", step: 1, freq: 311.13, octaveName: "Jednočárkovaná" },
    { id: "t-es1", base: "e", accidental: "flat", pitchClass: "es", label: "es1", step: 2, freq: 311.13, octaveName: "Jednočárkovaná" },
    { id: "t-e1", base: "e", accidental: "natural", pitchClass: "e", label: "e1", step: 2, freq: 329.63, octaveName: "Jednočárkovaná" },
    { id: "t-f1", base: "f", accidental: "natural", pitchClass: "f", label: "f1", step: 3, freq: 349.23, octaveName: "Jednočárkovaná" },
    { id: "t-fis1", base: "f", accidental: "sharp", pitchClass: "fis", label: "fis1", step: 3, freq: 369.99, octaveName: "Jednočárkovaná" },
    { id: "t-ges1", base: "g", accidental: "flat", pitchClass: "ges", label: "ges1", step: 4, freq: 369.99, octaveName: "Jednočárkovaná" },
    { id: "t-g1", base: "g", accidental: "natural", pitchClass: "g", label: "g1", step: 4, freq: 392.00, octaveName: "Jednočárkovaná" },
    { id: "t-gis1", base: "g", accidental: "sharp", pitchClass: "gis", label: "gis1", step: 4, freq: 415.30, octaveName: "Jednočárkovaná" },
    { id: "t-as1", base: "a", accidental: "flat", pitchClass: "as", label: "as1", step: 5, freq: 415.30, octaveName: "Jednočárkovaná" },
    { id: "t-a1", base: "a", accidental: "natural", pitchClass: "a", label: "a1", step: 5, freq: 440.00, octaveName: "Jednočárkovaná" },
    { id: "t-ais1", base: "a", accidental: "sharp", pitchClass: "ais", label: "ais1", step: 5, freq: 466.16, octaveName: "Jednočárkovaná" },
    { id: "t-b1", base: "h", accidental: "flat", pitchClass: "b", label: "b1 (hes1)", step: 6, freq: 466.16, octaveName: "Jednočárkovaná" },
    { id: "t-h1", base: "h", accidental: "natural", pitchClass: "h", label: "h1", step: 6, freq: 493.88, octaveName: "Jednočárkovaná" },
    { id: "t-c2", base: "c", accidental: "natural", pitchClass: "c", label: "c2", step: 7, freq: 523.25, octaveName: "Dvoučárkovaná" },
    { id: "t-cis2", base: "c", accidental: "sharp", pitchClass: "cis", label: "cis2", step: 7, freq: 554.37, octaveName: "Dvoučárkovaná" },
    { id: "t-d2", base: "d", accidental: "natural", pitchClass: "d", label: "d2", step: 8, freq: 587.33, octaveName: "Dvoučárkovaná" },
    { id: "t-es2", base: "e", accidental: "flat", pitchClass: "es", label: "es2", step: 9, freq: 622.25, octaveName: "Dvoučárkovaná" },
    { id: "t-e2", base: "e", accidental: "natural", pitchClass: "e", label: "e2", step: 9, freq: 659.25, octaveName: "Dvoučárkovaná" },
    { id: "t-f2", base: "f", accidental: "natural", pitchClass: "f", label: "f2", step: 10, freq: 698.46, octaveName: "Dvoučárkovaná" },
    { id: "t-fis2", base: "f", accidental: "sharp", pitchClass: "fis", label: "fis2", step: 10, freq: 739.99, octaveName: "Dvoučárkovaná" },
    { id: "t-g2", base: "g", accidental: "natural", pitchClass: "g", label: "g2", step: 11, freq: 783.99, octaveName: "Dvoučárkovaná" },
  ],
  bass: [
    { id: "b-F", base: "f", accidental: "natural", pitchClass: "f", label: "F", step: 1, freq: 87.31, octaveName: "Velká" },
    { id: "b-Fis", base: "f", accidental: "sharp", pitchClass: "fis", label: "Fis", step: 1, freq: 92.50, octaveName: "Velká" },
    { id: "b-G", base: "g", accidental: "natural", pitchClass: "g", label: "G", step: 2, freq: 98.00, octaveName: "Velká" },
    { id: "b-As", base: "a", accidental: "flat", pitchClass: "as", label: "As", step: 3, freq: 103.83, octaveName: "Velká" },
    { id: "b-A", base: "a", accidental: "natural", pitchClass: "a", label: "A", step: 3, freq: 110.00, octaveName: "Velká" },
    { id: "b-B", base: "h", accidental: "flat", pitchClass: "b", label: "B (Hes)", step: 4, freq: 116.54, octaveName: "Velká" },
    { id: "b-H", base: "h", accidental: "natural", pitchClass: "h", label: "H", step: 4, freq: 123.47, octaveName: "Velká" },
    { id: "b-c", base: "c", accidental: "natural", pitchClass: "c", label: "c", step: 5, freq: 130.81, octaveName: "Malá" },
    { id: "b-cis", base: "c", accidental: "sharp", pitchClass: "cis", label: "cis", step: 5, freq: 138.59, octaveName: "Malá" },
    { id: "b-d", base: "d", accidental: "natural", pitchClass: "d", label: "d", step: 6, freq: 146.83, octaveName: "Malá" },
    { id: "b-es", base: "e", accidental: "flat", pitchClass: "es", label: "es", step: 7, freq: 155.56, octaveName: "Malá" },
    { id: "b-e", base: "e", accidental: "natural", pitchClass: "e", label: "e", step: 7, freq: 164.81, octaveName: "Malá" },
    { id: "b-f", base: "f", accidental: "natural", pitchClass: "f", label: "f", step: 8, freq: 174.61, octaveName: "Malá" },
    { id: "b-fis", base: "f", accidental: "sharp", pitchClass: "fis", label: "fis", step: 8, freq: 185.00, octaveName: "Malá" },
    { id: "b-g", base: "g", accidental: "natural", pitchClass: "g", label: "g", step: 9, freq: 196.00, octaveName: "Malá" },
    { id: "b-as", base: "a", accidental: "flat", pitchClass: "as", label: "as", step: 10, freq: 207.65, octaveName: "Malá" },
    { id: "b-a", base: "a", accidental: "natural", pitchClass: "a", label: "a", step: 10, freq: 220.00, octaveName: "Malá" },
    { id: "b-b", base: "h", accidental: "flat", pitchClass: "b", label: "b (hes)", step: 11, freq: 233.08, octaveName: "Malá" },
    { id: "b-h", base: "h", accidental: "natural", pitchClass: "h", label: "h", step: 11, freq: 246.94, octaveName: "Malá" },
    { id: "b-c1", base: "c", accidental: "natural", pitchClass: "c", label: "c1", step: 12, freq: 261.63, octaveName: "Jednočárkovaná" },
  ],
};

interface StaffProps {
  clef: ClefType;
  activeNote: NoteItem;
  showLabel: boolean;
  colorHints: boolean;
  status?: "idle" | "correct" | "wrong";
}

export const Staff: React.FC<StaffProps> = ({
  clef,
  activeNote,
  showLabel,
  colorHints,
  status = "idle",
}) => {
  const lineSpacing = 15;
  const halfStep = lineSpacing / 2;
  const bottomLineY = 122; // Spodní linka osnovy (step = 2)
  const noteY = bottomLineY - (activeNote.step - 2) * halfStep;
  const noteX = 212;

  const baseToneColor = NOTE_COLORS[activeNote.base] || "#4f46e5";

  const noteColor =
    status === "correct"
      ? "#16a34a"
      : status === "wrong"
      ? "#dc2626"
      : colorHints
      ? baseToneColor
      : "#1e1b4b";

  const borderClass =
    status === "correct"
      ? "border-emerald-500 ring-4 ring-emerald-100"
      : status === "wrong"
      ? "border-rose-500 ring-4 ring-rose-100"
      : "border-indigo-100";

  return (
    <div
      className={`w-full bg-gradient-to-b from-white to-indigo-50/40 rounded-3xl border-2 ${borderClass} p-3 shadow-md transition-all`}
    >
      <svg
        viewBox="0 0 320 182"
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
              x1="22"
              y1={y}
              x2="298"
              y2={y}
              stroke="#94a3b8"
              strokeWidth="1.6"
            />
          );
        })}

        {/* Správný houslový klíč – začíná tečkou na 2. lince (g1, Y = 125), obtočí ji, jde nahoru do smyčky a dolů s ocáskem */}
        {clef === "treble" ? (
          <g fill="none" stroke="#4338ca" strokeLinecap="round" strokeLinejoin="round">
            {/* Začáteční tečka přesně na 2. lince (g1) */}
            <circle cx="62" cy="125" r="2.8" fill="#4338ca" stroke="none" />
            {/* Spirála od g1 doprava nahoru -> dolů na 1. linku (e1) -> doleva nahoru nad osnovu -> horní smyčka -> svisle dolů pod osnovu */}
            <path
              strokeWidth="3.4"
              d="M 62 125
                 C 62 117, 73 116, 75 124
                 C 77 134, 66 141, 56 137
                 C 45 132, 43 118, 52 108
                 C 62 97, 74 86, 72 72
                 C 70 62, 61 62, 60 73
                 L 63 152
                 C 63 161, 55 164, 50 159
                 C 46 155, 49 149, 54 151"
            />
          </g>
        ) : (
          /* Správný basový klíč – velká tečka na 4. lince (f, Y = 99) + oblouk doprava + dvě tečky kolem 4. linky */
          <g fill="none" stroke="#ea580c" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="52" cy="99" r="4.8" fill="#ea580c" stroke="none" />
            <path
              strokeWidth="3.8"
              d="M 52 99
                 C 62 85, 80 90, 80 108
                 C 80 124, 65 134, 48 140"
            />
            <circle cx="88" cy="92.5" r="2.5" fill="#ea580c" stroke="none" />
            <circle cx="88" cy="105.5" r="2.5" fill="#ea580c" stroke="none" />
          </g>
        )}

        {/* Pomocná linka dole (c1 / cis1 v houslovém klíči) */}
        {activeNote.step <= 0 && (
          <line
            x1={noteX - 20}
            y1={bottomLineY + lineSpacing}
            x2={noteX + 20}
            y2={bottomLineY + lineSpacing}
            stroke="#475569"
            strokeWidth="2.2"
          />
        )}

        {/* Pomocná linka nahoře (c1 v basovém klíči) */}
        {activeNote.step >= 12 && (
          <line
            x1={noteX - 20}
            y1={bottomLineY - 5 * lineSpacing}
            x2={noteX + 20}
            y2={bottomLineY - 5 * lineSpacing}
            stroke="#475569"
            strokeWidth="2.2"
          />
        )}

        {/* Posuvka: Křížek (♯) nebo Béčko (♭) vlevo od hlavičky noty */}
        {activeNote.accidental === "sharp" && (
          <g transform={`translate(${noteX - 27}, ${noteY})`} stroke={noteColor} strokeLinecap="round">
            <line x1="-4" y1="-13" x2="-4" y2="14" strokeWidth="2.1" />
            <line x1="4" y1="-15" x2="4" y2="12" strokeWidth="2.1" />
            <line x1="-9" y1="-4" x2="9" y2="-7" strokeWidth="3.2" />
            <line x1="-9" y1="6" x2="9" y2="3" strokeWidth="3.2" />
          </g>
        )}

        {activeNote.accidental === "flat" && (
          <g transform={`translate(${noteX - 24}, ${noteY})`} fill="none" stroke={noteColor} strokeLinecap="round">
            <line x1="-4" y1="-19" x2="-4" y2="7" strokeWidth="2.3" />
            <path
              d="M -4 -1 C 5 -7, 10 0, -4 8"
              strokeWidth="2.6"
            />
          </g>
        )}

        {/* Hlavička noty */}
        <ellipse
          cx={noteX}
          cy={noteY}
          rx="9.5"
          ry="6.8"
          transform={`rotate(-18 ${noteX} ${noteY})`}
          fill={noteColor}
        />

        {/* Nožička noty */}
        {activeNote.step < 6 ? (
          <line
            x1={noteX + 8.3}
            y1={noteY}
            x2={noteX + 8.3}
            y2={noteY - 42}
            stroke={noteColor}
            strokeWidth="2.5"
          />
        ) : (
          <line
            x1={noteX - 8.3}
            y1={noteY}
            x2={noteX - 8.3}
            y2={noteY + 42}
            stroke={noteColor}
            strokeWidth="2.5"
          />
        )}
      </svg>

      {/* Barevný štítek s názvem tónu */}
      <div className="h-8 flex items-center justify-center">
        {showLabel ? (
          <span
            className="px-3.5 py-0.5 rounded-full text-base font-extrabold text-white shadow-sm"
            style={{ backgroundColor: noteColor }}
          >
            {activeNote.label}{" "}
            <span className="text-xs font-normal opacity-90">
              ({activeNote.octaveName})
            </span>
          </span>
        ) : (
          <span className="text-sm font-semibold text-indigo-400">
            Poznej tón včetně posuvky (♯ / ♭)
          </span>
        )}
      </div>
    </div>
  );
};
