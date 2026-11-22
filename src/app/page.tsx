"use client";

import React, { useEffect, useState } from "react";
import { ClefType, NOTES_BY_CLEF, Staff } from "@/components/Staff";
import { playTone } from "@/lib/sound";

const PIANO_KEYS = [
  { base: "c", label: "C" },
  { base: "d", label: "D" },
  { base: "e", label: "E" },
  { base: "f", label: "F" },
  { base: "g", label: "G" },
  { base: "a", label: "A" },
  { base: "h", label: "H" },
];

export default function HomePage() {
  const [mode, setMode] = useState<"study" | "quiz">("study");
  const [clef, setClef] = useState<ClefType>("treble");
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState("Vyber správný tón dole");
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("foxnoty_stats");
    if (saved) {
      try {
        setStats(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const notes = NOTES_BY_CLEF[clef];
  const currentNote = notes[index] || notes[0];
  const masteryPct =
    stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);

  const pickRandomNote = (currentIdx: number) => {
    let next = Math.floor(Math.random() * notes.length);
    if (next === currentIdx && notes.length > 1) {
      next = (next + 1) % notes.length;
    }
    setIndex(next);
    setStatus("idle");
    setActiveKey(null);
  };

  const handleKeyPress = (base: string) => {
    if (mode === "study") {
      const foundIdx = notes.findIndex((n) => n.base === base);
      if (foundIdx !== -1) {
        setIndex(foundIdx);
        playTone(notes[foundIdx].freq);
      }
      return;
    }

    // Režim Kvíz
    const updatedStats = {
      correct: stats.correct + (base === currentNote.base ? 1 : 0),
      total: stats.total + 1,
    };
    setStats(updatedStats);
    localStorage.setItem("foxnoty_stats", JSON.stringify(updatedStats));
    setActiveKey(base);

    if (base === currentNote.base) {
      setStatus("correct");
      setStreak((s) => s + 1);
      setFeedback(`Správně! Je to ${currentNote.label}`);
      playTone(currentNote.freq);
      setTimeout(() => {
        pickRandomNote(index);
        setFeedback("Vyber další tón");
      }, 750);
    } else {
      setStatus("wrong");
      setStreak(0);
      setFeedback(`Zkus znovu (to není ${base.toUpperCase()})`);
      setTimeout(() => {
        setStatus("idle");
        setActiveKey(null);
      }, 650);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 flex justify-center">
      <div className="w-full max-w-md flex flex-col justify-between px-4 py-3 gap-2.5">
        {/* Horní lišta */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl">
              🦊
            </div>
            <div>
              <h1 className="text-lg font-extrabold leading-tight">Foxnoty</h1>
              <p className="text-xs text-slate-500">Melody Maestro</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-right">
            <span className="block text-[11px] text-slate-500">Mistrovství</span>
            <span className="font-extrabold text-indigo-600 text-base">
              {masteryPct} %
            </span>
          </div>
        </header>

        {/* Přepínač Studium / Kvíz */}
        <div className="grid grid-cols-2 bg-slate-200 p-1 rounded-xl">
          <button
            onClick={() => {
              setMode("study");
              setStatus("idle");
            }}
            className={`py-2 text-sm font-bold rounded-lg transition ${
              mode === "study"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600"
            }`}
          >
            📖 Studium
          </button>
          <button
            onClick={() => {
              setMode("quiz");
              pickRandomNote(index);
              setFeedback("Vyber správný tón dole");
            }}
            className={`py-2 text-sm font-bold rounded-lg transition ${
              mode === "quiz"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600"
            }`}
          >
            🎯 Kvíz
          </button>
        </div>

        {/* Výběr klíče a přehrání zvuku */}
        <div className="flex gap-2">
          <select
            value={clef}
            onChange={(e) => {
              setClef(e.target.value as ClefType);
              setIndex(0);
              setStatus("idle");
            }}
            aria-label="Výběr klíče"
            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold"
          >
            <option value="treble">🎼 Houslový klíč (c1–g2)</option>
            <option value="bass">𝄢 Basový klíč (F–c1)</option>
          </select>

          <button
            onClick={() => playTone(currentNote.freq)}
            className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold active:bg-indigo-50"
          >
            🔊 Zvuk
          </button>
        </div>

        {/* Notová osnova */}
        <main className="flex flex-col gap-2.5">
          <Staff
            clef={clef}
            activeNote={currentNote}
            showLabel={mode === "study" || status === "correct"}
            status={status}
          />

          {mode === "study" ? (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  const next = (index - 1 + notes.length) % notes.length;
                  setIndex(next);
                  playTone(notes[next].freq);
                }}
                className="bg-white border border-slate-200 rounded-xl py-2.5 text-sm font-semibold active:bg-slate-100"
              >
                ← Předchozí
              </button>
              <button
                onClick={() => {
                  const next = (index + 1) % notes.length;
                  setIndex(next);
                  playTone(notes[next].freq);
                }}
                className="bg-white border border-slate-200 rounded-xl py-2.5 text-sm font-semibold active:bg-slate-100"
              >
                Další →
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex justify-between items-center text-xs">
              <span>
                Série: <strong>{streak}</strong> 🔥
              </span>
              <span className="font-medium text-slate-600">{feedback}</span>
            </div>
          )}
        </main>

        {/* Mobilní klaviatura C–H */}
        <section className="mt-auto">
          <p className="text-xs text-slate-500 text-center mb-1.5">
            {mode === "study"
              ? "Klikni na klávesu pro zobrazení a poslech:"
              : "Poznej tón na osnově:"}
          </p>
          <div className="grid grid-cols-7 gap-1.5">
            {PIANO_KEYS.map((k) => {
              let keyStyle =
                "bg-white border-slate-300 border-b-slate-400 text-slate-900";
              if (activeKey === k.base && status === "correct") {
                keyStyle =
                  "bg-green-100 border-green-600 border-b-green-700 text-green-700";
              } else if (activeKey === k.base && status === "wrong") {
                keyStyle =
                  "bg-red-100 border-red-600 border-b-red-700 text-red-700";
              }

              return (
                <button
                  key={k.base}
                  onClick={() => handleKeyPress(k.base)}
                  className={`h-20 border border-b-4 rounded-b-xl font-extrabold text-base flex items-end justify-center pb-2.5 active:translate-y-0.5 transition ${keyStyle}`}
                >
                  {k.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Patička + Ochrana soukromí */}
        <footer className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
          <span>Foxnoty © 2026</span>
          <button
            onClick={() => setShowPrivacy(true)}
            className="text-indigo-600 underline"
          >
            Ochrana soukromí
          </button>
        </footer>
      </div>

      {/* Modální okno Zásady ochrany osobních údajů */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-sm flex flex-col gap-3 text-sm leading-relaxed">
            <h2 className="font-bold text-base">
              Zásady ochrany osobních údajů
            </h2>
            <p>
              Aplikace <strong>Foxnoty (Melody Maestro)</strong> neshromažďuje,
              neukládá ani nesdílí žádné osobní údaje uživatelů na externích
              serverech.
            </p>
            <p>
              Veškerý studijní pokrok (skóre Mistrovství) je uložen pouze
              lokálně ve vašem zařízení.
            </p>
            <button
              onClick={() => setShowPrivacy(false)}
              className="bg-indigo-600 text-white font-semibold py-2 rounded-xl mt-1"
            >
              Zavřít
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
