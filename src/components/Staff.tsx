"use client";

import React from "react";

export type ClefType = "treble" | "bass";
export type AccidentalType = "natural" | "sharp" | "flat";
export type FilterMode = "natural" | "sharps" | "flats" | "all";
export type OctaveFilter =
  | "all"
  | "kontra-velka"
  | "mala"
  | "jednocarkovana"
  | "dvoucarkovana"
  | "tricarkovana";

export interface NoteItem {
  id: string;
  base: string;
  accidental: AccidentalType;
  pitchClass: string;
  label: string;
  step: number;
  freq: number;
  octaveKey: OctaveFilter;
  octaveName: string;
}

// Jemné pastelové unisex barvy ladící se zlatou (pro kluky i pro holky)
export const NOTE_COLORS: Record<string, string> = {
  c: "#f59e0b", // teplá zlatá
  d: "#fb923c", // meruňková
  e: "#eab308", // sluneční
  f: "#34d399", // šalvějově mátová
  g: "#2dd4bf", // jemná tyrkysová
  a: "#38bdf8", // nebeská modrá
  h: "#60a5fa", // chrpa
};

export const NOTES_BY_CLEF: Record<ClefType, NoteItem[]> = {
  treble: [
    // Malá oktáva pod osnovou
    { id: "t-g", base: "g", accidental: "natural", pitchClass: "g", label: "g", step: -3, freq: 196.00, octaveKey: "mala", octaveName: "Malá oktáva" },
    { id: "t-gis", base: "g", accidental: "sharp", pitchClass: "gis", label: "gis", step: -3, freq: 207.65, octaveKey: "mala", octaveName: "Malá oktáva" },
    { id: "t-as", base: "a", accidental: "flat", pitchClass: "as", label: "as", step: -2, freq: 207.65, octaveKey: "mala", octaveName: "Malá oktáva" },
    { id: "t-a", base: "a", accidental: "natural", pitchClass: "a", label: "a", step: -2, freq: 220.00, octaveKey: "mala", octaveName: "Malá oktáva" },
    { id: "t-b", base: "h", accidental: "flat", pitchClass: "b", label: "b (hes)", step: -1, freq: 233.08, octaveKey: "mala", octaveName: "Malá oktáva" },
    { id: "t-h", base: "h", accidental: "natural", pitchClass: "h", label: "h", step: -1, freq: 246.94, octaveKey: "mala", octaveName: "Malá oktáva" },

    // Jednočárkovaná oktáva (c1 - h1)
    { id: "t-c1", base: "c", accidental: "natural", pitchClass: "c", label: "c1", step: 0, freq: 261.63, octaveKey: "jednocarkovana", octaveName: "Jednočárkovaná" },
    { id: "t-cis1", base: "c", accidental: "sharp", pitchClass: "cis", label: "cis1", step: 0, freq: 277.18, octaveKey: "jednocarkovana", octaveName: "Jednočárkovaná" },
    { id: "t-des1", base: "d", accidental: "flat", pitchClass: "des", label: "des1", step: 1, freq: 277.18, octaveKey: "jednocarkovana", octaveName: "Jednočárkovaná" },
    { id: "t-d1", base: "d", accidental: "natural", pitchClass: "d", label: "d1", step: 1, freq: 293.66, octaveKey: "jednocarkovana", octaveName: "Jednočárkovaná" },
    { id: "t-dis1", base: "d", accidental: "sharp", pitchClass: "dis", label: "dis1", step: 1, freq: 311.13, octaveKey: "jednocarkovana", octaveName: "Jednočárkovaná" },
    { id: "t-es1", base: "e", accidental: "flat", pitchClass: "es", label: "es1", step: 2, freq: 311.13, octaveKey: "jednocarkovana", octaveName: "Jednočárkovaná" },
    { id: "t-e1", base: "e", accidental: "natural", pitchClass: "e", label: "e1", step: 2, freq: 329.63, octaveKey: "jednocarkovana", octaveName: "Jednočárkovaná" },
    { id: "t-f1", base: "f", accidental: "natural", pitchClass: "f", label: "f1", step: 3, freq: 349.23, octaveKey: "jednocarkovana", octaveName: "Jednočárkovaná" },
    { id: "t-fis1", base: "f", accidental: "sharp", pitchClass: "fis", label: "fis1", step: 3, freq: 369.99, octaveKey: "jednocarkovana", octaveName: "Jednočárkovaná" },
    { id: "t-ges1", base: "g", accidental: "flat", pitchClass: "ges", label: "ges1", step: 4, freq: 369.99, octaveKey: "jednocarkovana", octaveName: "Jednočárkovaná" },
    { id: "t-g1", base: "g", accidental: "natural", pitchClass: "g", label: "g1", step: 4, freq: 392.00, octaveKey: "jednocarkovana", octaveName: "Jednočárkovaná" },
    { id: "t-gis1", base: "g", accidental: "sharp", pitchClass: "gis", label: "gis1", step: 4, freq: 415.30, octaveKey: "jednocarkovana", octaveName: "Jednočárkovaná" },
    { id: "t-as1", base: "a", accidental: "flat", pitchClass: "as", label: "as1", step: 5, freq: 415.30, octaveKey: "jednocarkovana", octaveName: "Jednočárkovaná" },
    { id: "t-a1", base: "a", accidental: "natural", pitchClass: "a", label: "a1", step: 5, freq: 440.00, octaveKey: "jednocarkovana", octaveName: "Jednočárkovaná" },
    { id: "t-ais1", base: "a", accidental: "sharp", pitchClass: "ais", label: "ais1", step: 5, freq: 466.16, octaveKey: "jednocarkovana", octaveName: "Jednočárkovaná" },
    { id: "t-b1", base: "h", accidental: "flat", pitchClass: "b", label: "b1 (hes1)", step: 6, freq: 466.16, octaveKey: "jednocarkovana", octaveName: "Jednočárkovaná" },
    { id: "t-h1", base: "h", accidental: "natural", pitchClass: "h", label: "h1", step: 6, freq: 493.88, octaveKey: "jednocarkovana", octaveName: "Jednočárkovaná" },

    // Dvoučárkovaná oktáva (c2 - h2)
    { id: "t-c2", base: "c", accidental: "natural", pitchClass: "c", label: "c2", step: 7, freq: 523.25, octaveKey: "dvoucarkovana", octaveName: "Dvoučárkovaná" },
    { id: "t-cis2", base: "c", accidental: "sharp", pitchClass: "cis", label: "cis2", step: 7, freq: 554.37, octaveKey: "dvoucarkovana", octaveName: "Dvoučárkovaná" },
    { id: "t-d2", base: "d", accidental: "natural", pitchClass: "d", label: "d2", step: 8, freq: 587.33, octaveKey: "dvoucarkovana", octaveName: "Dvoučárkovaná" },
    { id: "t-es2", base: "e", accidental: "flat", pitchClass: "es", label: "es2", step: 9, freq: 622.25, octaveKey: "dvoucarkovana", octaveName: "Dvoučárkovaná" },
    { id: "t-e2", base: "e", accidental: "natural", pitchClass: "e", label: "e2", step: 9, freq: 659.25, octaveKey: "dvoucarkovana", octaveName: "Dvoučárkovaná" },
    { id: "t-f2", base: "f", accidental: "natural", pitchClass: "f", label: "f2", step: 10, freq: 698.46, octaveKey: "dvoucarkovana", octaveName: "Dvoučárkovaná" },
    { id: "t-fis2", base: "f", accidental: "sharp", pitchClass: "fis", label: "fis2", step: 10, freq: 739.99, octaveKey: "dvoucarkovana", octaveName: "Dvoučárkovaná" },
    { id: "t-g2", base: "g", accidental: "natural", pitchClass: "g", label: "g2", step: 11, freq: 783.99, octaveKey: "dvoucarkovana", octaveName: "Dvoučárkovaná" },
    { id: "t-a2", base: "a", accidental: "natural", pitchClass: "a", label: "a2", step: 12, freq: 880.00, octaveKey: "dvoucarkovana", octaveName: "Dvoučárkovaná" },
    { id: "t-b2", base: "h", accidental: "flat", pitchClass: "b", label: "b2 (hes2)", step: 13, freq: 932.33, octaveKey: "dvoucarkovana", octaveName: "Dvoučárkovaná" },
    { id: "t-h2", base: "h", accidental: "natural", pitchClass: "h", label: "h2", step: 13, freq: 987.77, octaveKey: "dvoucarkovana", octaveName: "Dvoučárkovaná" },

    // Tříčárkovaná oktáva (c3 - g3)
    { id: "t-c3", base: "c", accidental: "natural", pitchClass: "c", label: "c3", step: 14, freq: 1046.50, octaveKey: "tricarkovana", octaveName: "Tříčárkovaná" },
    { id: "t-d3", base: "d", accidental: "natural", pitchClass: "d", label: "d3", step: 15, freq: 1174.66, octaveKey: "tricarkovana", octaveName: "Tříčárkovaná" },
    { id: "t-e3", base: "e", accidental: "natural", pitchClass: "e", label: "e3", step: 16, freq: 1318.51, octaveKey: "tricarkovana", octaveName: "Tříčárkovaná" },
    { id: "t-f3", base: "f", accidental: "natural", pitchClass: "f", label: "f3", step: 17, freq: 1396.91, octaveKey: "tricarkovana", octaveName: "Tříčárkovaná" },
    { id: "t-g3", base: "g", accidental: "natural", pitchClass: "g", label: "g3", step: 18, freq: 1567.98, octaveKey: "tricarkovana", octaveName: "Tříčárkovaná" },
  ],

  bass: [
    { id: "b-A1", base: "a", accidental: "natural", pitchClass: "a", label: "A1", step: -4, freq: 55.00, octaveKey: "kontra-velka", octaveName: "Kontra oktáva" },
    { id: "b-H1", base: "h", accidental: "natural", pitchClass: "h", label: "H1", step: -3, freq: 61.74, octaveKey: "kontra-velka", octaveName: "Kontra oktáva" },
    { id: "b-C", base: "c", accidental: "natural", pitchClass: "c", label: "C", step: -2, freq: 65.41, octaveKey: "kontra-velka", octaveName: "Velká oktáva" },
    { id: "b-Cis", base: "c", accidental: "sharp", pitchClass: "cis", label: "Cis", step: -2, freq: 69.30, octaveKey: "kontra-velka", octaveName: "Velká oktáva" },
    { id: "b-D", base: "d", accidental: "natural", pitchClass: "d", label: "D", step: -1, freq: 73.42, octaveKey: "kontra-velka", octaveName: "Velká oktáva" },
    { id: "b-Es", base: "e", accidental: "flat", pitchClass: "es", label: "Es", step: 0, freq: 77.78, octaveKey: "kontra-velka", octaveName: "Velká oktáva" },
    { id: "b-E", base: "e", accidental: "natural", pitchClass: "e", label: "E", step: 0, freq: 82.41, octaveKey: "kontra-velka", octaveName: "Velká oktáva" },
    { id: "b-F", base: "f", accidental: "natural", pitchClass: "f", label: "F", step: 1, freq: 87.31, octaveKey: "kontra-velka", octaveName: "Velká oktáva" },
    { id: "b-Fis", base: "f", accidental: "sharp", pitchClass: "fis", label: "Fis", step: 1, freq: 92.50, octaveKey: "kontra-velka", octaveName: "Velká oktáva" },
    { id: "b-G", base: "g", accidental: "natural", pitchClass: "g", label: "G", step: 2, freq: 98.00, octaveKey: "kontra-velka", octaveName: "Velká oktáva" },
    { id: "b-As", base: "a", accidental: "flat", pitchClass: "as", label: "As", step: 3, freq: 103.83, octaveKey: "kontra-velka", octaveName: "Velká oktáva" },
    { id: "b-A", base: "a", accidental: "natural", pitchClass: "a", label: "A", step: 3, freq: 110.00, octaveKey: "kontra-velka", octaveName: "Velká oktáva" },
    { id: "b-B", base: "h", accidental: "flat", pitchClass: "b", label: "B (Hes)", step: 4, freq: 116.54, octaveKey: "kontra-velka", octaveName: "Velká oktáva" },
    { id: "b-H", base: "h", accidental: "natural", pitchClass: "h", label: "H", step: 4, freq: 123.47, octaveKey: "kontra-velka", octaveName: "Velká oktáva" },

    { id: "b-c", base: "c", accidental: "natural", pitchClass: "c", label: "c", step: 5, freq: 130.81, octaveKey: "mala", octaveName: "Malá oktáva" },
    { id: "b-cis", base: "c", accidental: "sharp", pitchClass: "cis", label: "cis", step: 5, freq: 138.59, octaveKey: "mala", octaveName: "Malá oktáva" },
    { id: "b-d", base: "d", accidental: "natural", pitchClass: "d", label: "d", step: 6, freq: 146.83, octaveKey: "mala", octaveName: "Malá oktáva" },
    { id: "b-es", base: "e", accidental: "flat", pitchClass: "es", label: "es", step: 7, freq: 155.56, octaveKey: "mala", octaveName: "Malá oktáva" },
    { id: "b-e", base: "e", accidental: "natural", pitchClass: "e", label: "e", step: 7, freq: 164.81, octaveKey: "mala", octaveName: "Malá oktáva" },
    { id: "b-f", base: "f", accidental: "natural", pitchClass: "f", label: "f", step: 8, freq: 174.61, octaveKey: "mala", octaveName: "Malá oktáva" },
    { id: "b-fis", base: "f", accidental: "sharp", pitchClass: "fis", label: "fis", step: 8, freq: 185.00, octaveKey: "mala", octaveName: "Malá oktáva" },
    { id: "b-g", base: "g", accidental: "natural", pitchClass: "g", label: "g", step: 9, freq: 196.00, octaveKey: "mala", octaveName: "Malá oktáva" },
    { id: "b-as", base: "a", accidental: "flat", pitchClass: "as", label: "as", step: 10, freq: 207.65, octaveKey: "mala", octaveName: "Malá oktáva" },
    { id: "b-a", base: "a", accidental: "natural", pitchClass: "a", label: "a", step: 10, freq: 220.00, octaveKey: "mala", octaveName: "Malá oktáva" },
    { id: "b-b", base: "h", accidental: "flat", pitchClass: "b", label: "b (hes)", step: 11, freq: 233.08, octaveKey: "mala", octaveName: "Malá oktáva" },
    { id: "b-h", base: "h", accidental: "natural", pitchClass: "h", label: "h", step: 11, freq: 246.94, octaveKey: "mala", octaveName: "Malá oktáva" },

    { id: "b-c1", base: "c", accidental: "natural", pitchClass: "c", label: "c1", step: 12, freq: 261.63, octaveKey: "jednocarkovana", octaveName: "Jednočárkovaná" },
    { id: "b-d1", base: "d", accidental: "natural", pitchClass: "d", label: "d1", step: 13, freq: 293.66, octaveKey: "jednocarkovana", octaveName: "Jednočárkovaná" },
    { id: "b-e1", base: "e", accidental: "natural", pitchClass: "e", label: "e1", step: 14, freq: 329.63, octaveKey: "jednocarkovana", octaveName: "Jednočárkovaná" },
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
  const lineSpacing = 13;
  const halfStep = lineSpacing / 2;
  const bottomLineY = 138; // 1. linka (e1 v houslovém, G v basovém)
  const noteY = bottomLineY - (activeNote.step - 2) * halfStep;
  const noteX = 215;

  const baseToneColor = NOTE_COLORS[activeNote.base] || "#f59e0b";

  const noteColor =
    status === "correct"
      ? "#10b981"
      : status === "wrong"
      ? "#ef4444"
      : colorHints
      ? baseToneColor
      : "#334155";

  const borderClass =
    status === "correct"
      ? "border-emerald-300 ring-4 ring-emerald-100"
      : status === "wrong"
      ? "border-rose-300 ring-4 ring-rose-100"
      : "border-amber-200/80";

  const ledgerLinesY: number[] = [];
  if (activeNote.step <= 0) {
    for (let s = 0; s >= activeNote.step; s -= 2) {
      ledgerLinesY.push(bottomLineY - (s - 2) * halfStep);
    }
  }
  if (activeNote.step >= 12) {
    for (let s = 12; s <= activeNote.step; s += 2) {
      ledgerLinesY.push(bottomLineY - (s - 2) * halfStep);
    }
  }

  return (
    <div
      className={`relative w-full bg-white/95 rounded-3xl border-2 ${borderClass} p-3 shadow-sm transition-all overflow-hidden`}
    >
      {/* Zlaté dekorační hvězdičky v rozích karty */}
      <span className="absolute top-2.5 left-3.5 text-sm text-amber-400 select-none">✦</span>
      <span className="absolute top-2.5 right-3.5 text-sm text-amber-400 select-none">♪</span>

      <svg
        viewBox="0 0 320 205"
        className="w-full max-h-52 select-none"
        role="img"
        aria-label={`Notová osnova – ${showLabel ? activeNote.label : "hádání tónu"}`}
      >
        {/* 5 linek notové osnovy */}
        {[0, 1, 2, 3, 4].map((lineIndex) => {
          const y = bottomLineY - lineIndex * lineSpacing;
          return (
            <line
              key={lineIndex}
              x1="20"
              y1={y}
              x2="300"
              y2={y}
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Houslový klíč – spirála obepíná 2. linku (g1, Y=125), stoupá vzhůru do smyčky a končí tečkou dole */}
        {clef === "treble" ? (
          <g fill="none" stroke="#92400e" strokeLinecap="round" strokeLinejoin="round">
            {/* Začátek na 2. lince (g1, Y=125), spirála doprava dolů k 1. lince (Y=138), pak vlevo nahoru nad osnovu */}
            <path
              strokeWidth="3.6"
              d="M 65 127
                 C 61 124, 62 116, 69 116
                 C 77 116, 82 124, 79 132
                 C 76 140, 64 143, 55 138
                 C 44 132, 43 116, 54 104
                 C 64 93, 76 81, 74 67
                 C 72 58, 63 58, 62 68
                 L 67 154
                 C 68 163, 60 168, 53 164"
            />
            {/* Kulatá tečka na konci dole vlevo */}
            <circle cx="52" cy="161" r="4.2" fill="#92400e" stroke="none" />
          </g>
        ) : (
          /* Basový klíč – velká kulatá tečka na 4. lince (f, Y=99) + oblouk + dvě tečky kolem 4. linky */
          <g fill="none" stroke="#0f766e" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="53" cy="99" r="5" fill="#0f766e" stroke="none" />
            <path
              strokeWidth="3.8"
              d="M 53 99
                 C 63 85, 81 90, 81 108
                 C 81 124, 66 135, 48 141"
            />
            <circle cx="90" cy="92.5" r="2.6" fill="#0f766e" stroke="none" />
            <circle cx="90" cy="105.5" r="2.6" fill="#0f766e" stroke="none" />
          </g>
        )}

        {/* Pomocné linky */}
        {ledgerLinesY.map((ly, idx) => (
          <line
            key={idx}
            x1={noteX - 18}
            y1={ly}
            x2={noteX + 18}
            y2={ly}
            stroke="#64748b"
            strokeWidth="1.8"
          />
        ))}

        {/* Křížek (♯) */}
        {activeNote.accidental === "sharp" && (
          <g transform={`translate(${noteX - 25}, ${noteY})`} stroke={noteColor} strokeLinecap="round">
            <line x1="-3.5" y1="-12" x2="-3.5" y2="13" strokeWidth="2" />
            <line x1="3.5" y1="-14" x2="3.5" y2="11" strokeWidth="2" />
            <line x1="-8" y1="-3.5" x2="8" y2="-6.5" strokeWidth="3" />
            <line x1="-8" y1="5.5" x2="8" y2="2.5" strokeWidth="3" />
          </g>
        )}

        {/* Béčko (♭) */}
        {activeNote.accidental === "flat" && (
          <g transform={`translate(${noteX - 22}, ${noteY})`} fill="none" stroke={noteColor} strokeLinecap="round">
            <line x1="-3.5" y1="-18" x2="-3.5" y2="6.5" strokeWidth="2.2" />
            <path d="M -3.5 -1 C 4.5 -6.5, 9 0, -3.5 7.5" strokeWidth="2.5" />
          </g>
        )}

        {/* Hlavička noty */}
        <ellipse
          cx={noteX}
          cy={noteY}
          rx="8.5"
          ry="6"
          transform={`rotate(-18 ${noteX} ${noteY})`}
          fill={noteColor}
        />

        {/* Nožička noty */}
        {activeNote.step < 6 ? (
          <line
            x1={noteX + 7.5}
            y1={noteY}
            x2={noteX + 7.5}
            y2={noteY - 36}
            stroke={noteColor}
            strokeWidth="2.3"
          />
        ) : (
          <line
            x1={noteX - 7.5}
            y1={noteY}
            x2={noteX - 7.5}
            y2={noteY + 36}
            stroke={noteColor}
            strokeWidth="2.3"
          />
        )}
      </svg>

      {/* Štítek s názvem tónu */}
      <div className="h-8 flex items-center justify-center">
        {showLabel ? (
          <span
            className="px-4 py-0.5 rounded-full text-sm font-extrabold text-slate-900 shadow-xs"
            style={{ backgroundColor: noteColor }}
          >
            {activeNote.label}{" "}
            <span className="text-xs font-medium opacity-85">
              ({activeNote.octaveName})
            </span>
          </span>
        ) : (
          <span className="text-xs font-semibold text-amber-700">
            Poznej tón na osnově ✦
          </span>
        )}
      </div>
    </div>
  );
};
