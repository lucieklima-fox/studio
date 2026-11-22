"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ClefType,
  FilterMode,
  NOTE_COLORS,
  NOTES_BY_CLEF,
  Staff,
} from "@/components/Staff";
import { playTone } from "@/lib/sound";

const WHITE_KEYS = [
  { base: "c", label: "C" },
  { base: "d", label: "D" },
  { base: "e", label: "E" },
  { base: "f", label: "F" },
  { base: "g", label: "G" },
  { base: "a", label: "A" },
  { base: "h", label: "H" },
];

// Černé půltónové klávesy (s českým pojmenováním)
const BLACK_KEYS = [
  { id: "cis-des", labels: ["cis", "des"], display: "cis/des", leftPct: 10.5 },
  { id: "dis-es", labels: ["dis", "es"], display: "dis/es", leftPct: 24.8 },
  { id: "fis-ges", labels: ["fis", "ges"], display: "fis/ges", leftPct: 53.3 },
  { id: "gis-as", labels: ["gis", "as"], display: "gis/as", leftPct: 67.6 },
  { id: "ais-b", labels: ["ais", "b"], display: "ais/b", leftPct: 81.9 },
];

export default function HomePage() {
  const [mode, setMode] = useState<"study" | "quiz">("study");
  const [clef, setClef] = useState<ClefType>("treble");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [colorHints, setColorHints] = useState(true);
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

  // Filtrovaný seznam tónů podle klíče a posuvek
  const notes = useMemo(() => {
    const list = NOTES_BY_CLEF[clef];
    if (filterMode === "natural") return list.filter((n) => n.accidental === "natural");
    if (filterMode === "sharps") return list.filter((n) => n.accidental !== "flat");
    if (filterMode === "flats") return list.filter((n) => n.accidental !== "sharp");
    return list;
  }, [clef, filterMode]);

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

  // Zpracování stisku bílé klávesy (základní tón) nebo černé klávesy (křížek/béčko)
  const handleKeyPress = (acceptedPitchClasses: string[], keyId: string) => {
    if (mode === "study") {
      const foundIdx = notes.findIndex((n) =>
        acceptedPitchClasses.includes(n.pitchClass)
      );
      if (foundIdx !== -1) {
        setIndex(foundIdx);
        playTone(notes[foundIdx].freq);
      } else {
        // Pokud je zapnutý filtr jen na základní tóny a uživatel klikne na černou klávesu
        const fallback = NOTES_BY_CLEF[clef].find((n) =>
          acceptedPitchClasses.includes(n.pitchClass)
        );
        if (fallback) playTone(fallback.freq);
      }
      return;
    }

    // Režim Kvíz
    const isMatch = acceptedPitchClasses.includes(currentNote.pitchClass);
    const updatedStats = {
      correct: stats.correct + (isMatch ? 1 : 0),
      total: stats.total + 1,
    };
    setStats(updatedStats);
    localStorage.setItem("foxnoty_stats", JSON.stringify(updatedStats));
    setActiveKey(keyId);

    if (isMatch) {
      setStatus("correct");
      setStreak((s) => s + 1);
      setFeedback(`Skvěle! Je to ${currentNote.label}`);
      playTone(currentNote.freq);
      setTimeout(() => {
        pickRandomNote(index);
        setFeedback("Vyber další tón");
      }, 750);
    } else {
      setStatus("wrong");
      setStreak(0);
      setFeedback(`Zkus znovu (to není ${keyId.toUpperCase()})`);
      setTimeout(() => {
        setStatus("idle");
        setActiveKey(null);
      }, 650);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-amber-50 via-orange-50/40 to-indigo-50 text-slate-900 flex justify-center">
      <div className="w-full max-w-md flex flex-col justify-between px-4 py-3 gap-2">
        {/* Barevná horní lišta */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white shadow-sm flex items-center justify-center text-2xl">
              🦊
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-orange-600 to-indigo-600 bg-clip-text text-transparent">
                Foxnoty
              </h1>
              <p className="text-xs font-medium text-slate-500">Melody Maestro</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setColorHints(!colorHints)}
              title="Zapnout/vypnout barevné noty"
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                colorHints
                  ? "bg-gradient-to-r from-pink-500 to-amber-500 text-white border-transparent shadow-sm"
                  : "bg-white text-slate-500 border-slate-200"
              }`}
            >
              🎨 Barvy
            </button>
            <div className="bg-white/90 border border-orange-100 rounded-xl px-3 py-1 text-right shadow-sm">
              <span className="block text-[10px] font-semibold text-slate-400 uppercase">
                Mistrovství
              </span>
              <span className="font-black text-indigo-600 text-sm">
                {masteryPct} %
              </span>
            </div>
          </div>
        </header>

        {/* Přepínač Studium / Kvíz */}
        <div className="grid grid-cols-2 bg-white/80 border border-orange-100 p-1 rounded-2xl shadow-sm">
          <button
            onClick={() => {
              setMode("study");
              setStatus("idle");
            }}
            className={`py-2 text-sm font-extrabold rounded-xl transition ${
              mode === "study"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow"
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
            className={`py-2 text-sm font-extrabold rounded-xl transition ${
              mode === "quiz"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow"
                : "text-slate-600"
            }`}
          >
            🎯 Kvíz
          </button>
        </div>

        {/* Filtry: Klíč + Posuvky (♯/♭) + Zvuk */}
        <div className="grid grid-cols-12 gap-1.5">
          <select
            value={clef}
            onChange={(e) => {
              setClef(e.target.value as ClefType);
              setIndex(0);
              setStatus("idle");
            }}
            aria-label="Výběr klíče"
            className="col-span-5 bg-white border border-indigo-100 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 shadow-sm"
          >
            <option value="treble">🎼 Houslový klíč</option>
            <option value="bass">𝄢 Basový klíč</option>
          </select>

          <select
            value={filterMode}
            onChange={(e) => {
              setFilterMode(e.target.value as FilterMode);
              setIndex(0);
              setStatus("idle");
            }}
            aria-label="Výběr posuvek"
            className="col-span-4 bg-white border border-indigo-100 rounded-xl px-2 py-2 text-xs font-bold text-slate-800 shadow-sm"
          >
            <option value="all">♯♭ Všechny tóny</option>
            <option value="natural">♮ Základní (C–H)</option>
            <option value="sharps">♯ S křížky</option>
            <option value="flats">♭ S béčky</option>
          </select>

          <button
            onClick={() => playTone(currentNote.freq)}
            className="col-span-3 bg-indigo-600 text-white rounded-xl py-2 text-xs font-extrabold shadow-sm active:scale-95 transition"
          >
            🔊 Zvuk
          </button>
        </div>

        {/* Notová osnova */}
        <main className="flex flex-col gap-2">
          <Staff
            clef={clef}
            activeNote={currentNote}
            showLabel={mode === "study" || status === "correct"}
            colorHints={colorHints}
            status={status}
          />

          {mode === "study" ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const next = (index - 1 + notes.length) % notes.length;
                  setIndex(next);
                  playTone(notes[next].freq);
                }}
                className="bg-white border border-indigo-100 rounded-xl py-2 text-sm font-bold text-indigo-700 shadow-sm active:bg-indigo-50"
              >
                ← Předchozí
              </button>
              <button
                onClick={() => {
                  const next = (index + 1) % notes.length;
                  setIndex(next);
                  playTone(notes[next].freq);
                }}
                className="bg-white border border-indigo-100 rounded-xl py-2 text-sm font-bold text-indigo-700 shadow-sm active:bg-indigo-50"
              >
                Další →
              </button>
            </div>
          ) : (
            <div className="bg-white/90 border border-orange-100 rounded-xl px-3 py-2 flex justify-between items-center text-xs shadow-sm">
              <span>
                Série: <strong className="text-orange-600">{streak}</strong> 🔥
              </span>
              <span className="font-semibold text-slate-700">{feedback}</span>
            </div>
          )}
        </main>

        {/* Mobilní piano klaviatura (bílé C–H + černé půltónové klávesy) */}
        <section className="mt-auto">
          <p className="text-[11px] font-medium text-slate-500 text-center mb-1.5">
            {mode === "study"
              ? "Zahraj tón na klaviatuře (včetně křížků a béček):"
              : "Stiskni správnou klávesu:"}
          </p>

          <div className="relative h-28 select-none">
            {/* Bílé klávesy */}
            <div className="grid grid-cols-7 gap-1 h-full">
              {WHITE_KEYS.map((k) => {
                const toneColor = NOTE_COLORS[k.base];
                const isWrong = activeKey === k.base && status === "wrong";
                const isCorrect = activeKey === k.base && status === "correct";

                return (
                  <button
                    key={k.base}
                    onClick={() => handleKeyPress([k.base], k.base)}
                    className={`h-full rounded-b-2xl border border-slate-300 border-b-4 font-black text-base flex flex-col items-center justify-end pb-2 shadow-sm active:translate-y-0.5 transition ${
                      isCorrect
                        ? "bg-emerald-100 border-emerald-500"
                        : isWrong
                        ? "bg-rose-100 border-rose-500"
                        : "bg-white"
                    }`}
                  >
                    {colorHints && (
                      <span
                        className="w-3 h-3 rounded-full mb-1"
                        style={{ backgroundColor: toneColor }}
                      />
                    )}
                    <span>{k.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Černé klávesy (křížky a béčka) */}
            {BLACK_KEYS.map((bk) => {
              const isWrong = activeKey === bk.display && status === "wrong";
              const isCorrect = activeKey === bk.display && status === "correct";

              return (
                <button
                  key={bk.id}
                  onClick={() => handleKeyPress(bk.labels, bk.display)}
                  style={{ left: `${bk.leftPct}%`, width: "10.8%" }}
                  className={`absolute top-0 h-16 rounded-b-xl text-[9px] leading-tight font-bold text-white flex items-end justify-center pb-1.5 shadow-md active:translate-y-0.5 transition z-10 ${
                    isCorrect
                      ? "bg-emerald-600"
                      : isWrong
                      ? "bg-rose-600"
                      : "bg-slate-800 hover:bg-slate-700"
                  }`}
                >
                  <span className="text-center px-0.5">{bk.display}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Patička + Ochrana soukromí */}
        <footer className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
          <span>Foxnoty © 2026</span>
          <button
            onClick={() => setShowPrivacy(true)}
            className="text-indigo-600 font-medium underline"
          >
            Ochrana soukromí
          </button>
        </footer>
      </div>

      {/* Modální okno Zásady ochrany osobních údajů */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-sm flex flex-col gap-3 text-sm leading-relaxed shadow-xl">
            <h2 className="font-bold text-base text-slate-900">
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
