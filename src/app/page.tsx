"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ClefType,
  FilterMode,
  NOTE_COLORS,
  NOTES_BY_CLEF,
  OctaveFilter,
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

const BLACK_KEYS = [
  { id: "cis-des", labels: ["cis", "des"], display: "cis/des", leftPct: 10.5 },
  { id: "dis-es", labels: ["dis", "es"], display: "dis/es", leftPct: 24.8 },
  { id: "fis-ges", labels: ["fis", "ges"], display: "fis/ges", leftPct: 53.3 },
  { id: "gis-as", labels: ["gis", "as"], display: "gis/as", leftPct: 67.6 },
  { id: "ais-b", labels: ["ais", "b"], display: "ais/b", leftPct: 81.9 },
];

const QUIZ_LENGTH = 10;

export default function HomePage() {
  const [mode, setMode] = useState<"study" | "quiz">("study");
  const [clef, setClef] = useState<ClefType>("treble");
  const [octaveFilter, setOctaveFilter] = useState<OctaveFilter>("all");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [colorHints, setColorHints] = useState(true);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const [quizQuestion, setQuizQuestion] = useState(1);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [diamonds, setDiamonds] = useState(0);
  const [earnedDiamondNow, setEarnedDiamondNow] = useState(false);
  const [feedback, setFeedback] = useState("Vyber správný tón dole");
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const savedDiamonds = localStorage.getItem("foxnoty_diamonds");
    if (savedDiamonds) {
      setDiamonds(parseInt(savedDiamonds, 10) || 0);
    }
  }, []);

  const notes = useMemo(() => {
    let list = NOTES_BY_CLEF[clef];
    if (octaveFilter !== "all") {
      const byOctave = list.filter((n) => n.octaveKey === octaveFilter);
      if (byOctave.length > 0) list = byOctave;
    }
    if (filterMode === "natural") return list.filter((n) => n.accidental === "natural");
    if (filterMode === "sharps") return list.filter((n) => n.accidental !== "flat");
    if (filterMode === "flats") return list.filter((n) => n.accidental !== "sharp");
    return list;
  }, [clef, octaveFilter, filterMode]);

  const currentNote = notes[index] || notes[0];
  const quizScorePct = Math.round((quizCorrectCount / QUIZ_LENGTH) * 100);

  const pickRandomNote = (currentIdx: number) => {
    let next = Math.floor(Math.random() * notes.length);
    if (next === currentIdx && notes.length > 1) {
      next = (next + 1) % notes.length;
    }
    setIndex(next);
    setStatus("idle");
    setActiveKey(null);
  };

  const startNewQuiz = () => {
    setQuizQuestion(1);
    setQuizCorrectCount(0);
    setQuizFinished(false);
    setEarnedDiamondNow(false);
    setFeedback("Otázka 1 z 10 – poznej tón");
    pickRandomNote(index);
  };

  const playCelebration = () => {
    playTone(523.25, 0.25);
    setTimeout(() => playTone(659.25, 0.25), 140);
    setTimeout(() => playTone(783.99, 0.45), 280);
  };

  const handleKeyPress = (acceptedPitchClasses: string[], keyId: string) => {
    if (mode === "study") {
      const foundIdx = notes.findIndex((n) =>
        acceptedPitchClasses.includes(n.pitchClass)
      );
      if (foundIdx !== -1) {
        setIndex(foundIdx);
        playTone(notes[foundIdx].freq);
      } else {
        const fallback = NOTES_BY_CLEF[clef].find((n) =>
          acceptedPitchClasses.includes(n.pitchClass)
        );
        if (fallback) playTone(fallback.freq);
      }
      return;
    }

    if (quizFinished || status === "correct") return;

    const isMatch = acceptedPitchClasses.includes(currentNote.pitchClass);
    setActiveKey(keyId);

    if (isMatch) {
      const newCorrect = quizCorrectCount + 1;
      setQuizCorrectCount(newCorrect);
      setStatus("correct");
      setFeedback(`Správně! Je to ${currentNote.label} ✦`);
      playTone(currentNote.freq);

      setTimeout(() => {
        if (quizQuestion >= QUIZ_LENGTH) {
          const finalPct = Math.round((newCorrect / QUIZ_LENGTH) * 100);
          setQuizFinished(true);
          if (finalPct >= 90) {
            const nextDiamonds = diamonds + 1;
            setDiamonds(nextDiamonds);
            setEarnedDiamondNow(true);
            localStorage.setItem("foxnoty_diamonds", String(nextDiamonds));
            playCelebration();
          }
        } else {
          setQuizQuestion((q) => q + 1);
          pickRandomNote(index);
          setFeedback(`Otázka ${quizQuestion + 1} z ${QUIZ_LENGTH}`);
        }
      }, 750);
    } else {
      setStatus("wrong");
      setFeedback(`Zkus znovu (to není ${keyId.toUpperCase()})`);
      setTimeout(() => {
        setStatus("idle");
        setActiveKey(null);
      }, 650);
    }
  };

  return (
    <div
      className="min-h-[100dvh] text-slate-800 flex justify-center"
      style={{
        background:
          "linear-gradient(150deg, #fffbeb 0%, #fef3c7 45%, #ecfdf5 100%)",
      }}
    >
      <div className="w-full max-w-md flex flex-col justify-between px-4 py-3 gap-2">
        {/* Horní lišta: Zlatá + Šalvějová + Pytlíček na diamanty */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-11 h-11 rounded-2xl shadow-xs flex items-center justify-center text-2xl border border-amber-300"
              style={{
                background: "linear-gradient(135deg, #fde68a, #fed7aa)",
              }}
            >
              🦊
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-amber-900">
                Foxnoty
              </h1>
              <p className="text-xs font-medium text-amber-700/80">
                Melody Maestro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setColorHints(!colorHints)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                colorHints
                  ? "bg-amber-200 text-amber-950 border-amber-300"
                  : "bg-white/85 text-slate-500 border-slate-200"
              }`}
            >
              🎨 Barvy
            </button>

            <div
              title="Tvůj pytlíček na diamanty (odměna za kvíz nad 90 %)"
              className="bg-white/95 border border-amber-300 rounded-2xl px-3 py-1.5 flex items-center gap-1.5 shadow-xs"
            >
              <span className="text-base">👝</span>
              <span className="font-black text-amber-900 text-sm">
                {diamonds} 💎
              </span>
            </div>
          </div>
        </header>

        {/* Přepínač Studium / Kvíz */}
        <div className="grid grid-cols-2 bg-white/85 border border-amber-200 p-1 rounded-2xl shadow-xs">
          <button
            onClick={() => {
              setMode("study");
              setStatus("idle");
            }}
            className={`py-2 text-sm font-extrabold rounded-xl transition ${
              mode === "study"
                ? "bg-amber-200 text-amber-950 shadow-xs"
                : "text-slate-500"
            }`}
          >
            📖 Studium
          </button>
          <button
            onClick={() => {
              setMode("quiz");
              startNewQuiz();
            }}
            className={`py-2 text-sm font-extrabold rounded-xl transition ${
              mode === "quiz"
                ? "bg-emerald-200 text-emerald-950 shadow-xs"
                : "text-slate-500"
            }`}
          >
            🎯 Kvíz (10 tónů)
          </button>
        </div>

        {/* Filtry: Klíč + Oktáva + Posuvky */}
        <div className="grid grid-cols-12 gap-1.5">
          <select
            value={clef}
            onChange={(e) => {
              setClef(e.target.value as ClefType);
              setOctaveFilter("all");
              setIndex(0);
              setStatus("idle");
            }}
            aria-label="Výběr klíče"
            className="col-span-4 bg-white/95 border border-amber-200 rounded-xl px-2 py-2 text-xs font-bold text-slate-700"
          >
            <option value="treble">🎼 Houslový</option>
            <option value="bass">𝄢 Basový</option>
          </select>

          <select
            value={octaveFilter}
            onChange={(e) => {
              setOctaveFilter(e.target.value as OctaveFilter);
              setIndex(0);
              setStatus("idle");
            }}
            aria-label="Výběr oktávy"
            className="col-span-4 bg-white/95 border border-amber-200 rounded-xl px-2 py-2 text-xs font-bold text-slate-700"
          >
            <option value="all">Všechny oktávy</option>
            {clef === "bass" && (
              <option value="kontra-velka">Kontra & Velká</option>
            )}
            <option value="mala">Malá (c–h)</option>
            <option value="jednocarkovana">Jednočárk. (c1–h1)</option>
            {clef === "treble" && (
              <>
                <option value="dvoucarkovana">Dvoučárk. (c2–h2)</option>
                <option value="tricarkovana">Tříčárk. (c3–g3)</option>
              </>
            )}
          </select>

          <select
            value={filterMode}
            onChange={(e) => {
              setFilterMode(e.target.value as FilterMode);
              setIndex(0);
              setStatus("idle");
            }}
            aria-label="Výběr posuvek"
            className="col-span-4 bg-white/95 border border-amber-200 rounded-xl px-2 py-2 text-xs font-bold text-slate-700"
          >
            <option value="all">♯♭ Vše</option>
            <option value="natural">♮ Základní</option>
            <option value="sharps">♯ Křížky</option>
            <option value="flats">♭ Béčka</option>
          </select>
        </div>

        {/* Hlavní část: Notová osnova nebo vyhodnocení kvízu */}
        <main className="flex flex-col gap-2">
          {mode === "quiz" && quizFinished ? (
            <div className="bg-white/95 border-2 border-amber-300 rounded-3xl p-5 text-center flex flex-col items-center gap-2.5 shadow-sm">
              <div className="text-4xl">
                {earnedDiamondNow ? "🦊💎🎉" : "🦊✦"}
              </div>
              <h2 className="text-lg font-black text-amber-900">
                Výsledek kvízu: {quizScorePct} %
              </h2>
              <p className="text-xs text-slate-600">
                Správně {quizCorrectCount} z {QUIZ_LENGTH} tónů.
              </p>
              {earnedDiamondNow ? (
                <div className="bg-amber-100 text-amber-950 border border-amber-300 px-3.5 py-2 rounded-2xl text-xs font-bold">
                  ✦ Skvělá práce! Získáváš 1 zlatý diamant do pytlíčku!
                </div>
              ) : (
                <p className="text-xs text-amber-800 font-medium">
                  Dosáhni alespoň 90 % a získej další diamant 💎
                </p>
              )}
              <button
                onClick={startNewQuiz}
                className="mt-1 bg-amber-500 text-white px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-xs active:scale-95"
              >
                Hrát další kvíz →
              </button>
            </div>
          ) : (
            <>
              <Staff
                clef={clef}
                activeNote={currentNote}
                showLabel={mode === "study" || status === "correct"}
                colorHints={colorHints}
                status={status}
              />

              {mode === "study" ? (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      const next = (index - 1 + notes.length) % notes.length;
                      setIndex(next);
                      playTone(notes[next].freq);
                    }}
                    className="bg-white/95 border border-amber-200 rounded-xl py-2 text-xs font-bold text-amber-900 active:bg-amber-50"
                  >
                    ← Předchozí
                  </button>
                  <button
                    onClick={() => playTone(currentNote.freq)}
                    className="bg-amber-200 text-amber-950 border border-amber-300 rounded-xl py-2 text-xs font-extrabold active:scale-95"
                  >
                    🔊 Přehrát
                  </button>
                  <button
                    onClick={() => {
                      const next = (index + 1) % notes.length;
                      setIndex(next);
                      playTone(notes[next].freq);
                    }}
                    className="bg-white/95 border border-amber-200 rounded-xl py-2 text-xs font-bold text-amber-900 active:bg-amber-50"
                  >
                    Další →
                  </button>
                </div>
              ) : (
                <div className="bg-white/95 border border-emerald-200 rounded-xl px-3 py-2 flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-800">
                    {quizQuestion}/{QUIZ_LENGTH}
                  </span>
                  <span className="font-semibold text-slate-700">{feedback}</span>
                  <button
                    onClick={() => playTone(currentNote.freq)}
                    className="text-amber-800 font-extrabold underline"
                  >
                    🔊 Zvuk
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {/* Klaviatura */}
        <section className="mt-auto">
          <p className="text-[11px] font-medium text-amber-900/75 text-center mb-1.5">
            {mode === "study"
              ? "Zahraj tón na klaviatuře:"
              : "Stiskni správnou klávesu:"}
          </p>

          <div className="relative h-28 select-none">
            <div className="grid grid-cols-7 gap-1 h-full">
              {WHITE_KEYS.map((k) => {
                const toneColor = NOTE_COLORS[k.base];
                const isWrong = activeKey === k.base && status === "wrong";
                const isCorrect = activeKey === k.base && status === "correct";

                return (
                  <button
                    key={k.base}
                    onClick={() => handleKeyPress([k.base], k.base)}
                    className={`h-full rounded-b-2xl border border-amber-200 border-b-4 font-black text-base flex flex-col items-center justify-end pb-2 shadow-xs active:translate-y-0.5 transition ${
                      isCorrect
                        ? "bg-emerald-100 border-emerald-400"
                        : isWrong
                        ? "bg-rose-100 border-rose-400"
                        : "bg-white/95"
                    }`}
                  >
                    {colorHints && (
                      <span
                        className="w-4 h-4 rounded-full mb-1.5"
                        style={{ backgroundColor: toneColor }}
                      />
                    )}
                    <span className="text-slate-700">{k.label}</span>
                  </button>
                );
              })}
            </div>

            {BLACK_KEYS.map((bk) => {
              const isWrong = activeKey === bk.display && status === "wrong";
              const isCorrect = activeKey === bk.display && status === "correct";

              return (
                <button
                  key={bk.id}
                  onClick={() => handleKeyPress(bk.labels, bk.display)}
                  style={{ left: `${bk.leftPct}%`, width: "10.8%" }}
                  className={`absolute top-0 h-16 rounded-b-xl text-[9px] leading-tight font-bold text-white flex items-end justify-center pb-1.5 shadow-sm active:translate-y-0.5 transition z-10 ${
                    isCorrect
                      ? "bg-emerald-500"
                      : isWrong
                      ? "bg-rose-500"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                >
                  <span className="text-center px-0.5">{bk.display}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Patička */}
        <footer className="flex justify-between items-center text-[11px] text-amber-800/70 pt-0.5">
          <span>Foxnoty © 2026</span>
          <button
            onClick={() => setShowPrivacy(true)}
            className="text-amber-900 font-semibold underline"
          >
            Ochrana soukromí
          </button>
        </footer>
      </div>

      {showPrivacy && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-3xl p-5 max-w-sm flex flex-col gap-3 text-sm leading-relaxed shadow-xl border border-amber-200">
            <h2 className="font-bold text-base text-amber-900">
              Zásady ochrany osobních údajů
            </h2>
            <p>
              Aplikace <strong>Foxnoty (Melody Maestro)</strong> neshromažďuje,
              neukládá ani nesdílí žádné osobní údaje uživatelů na externích
              serverech.
            </p>
            <p>
              Nasbírané diamanty a pokrok jsou uloženy pouze lokálně ve vašem
              zařízení.
            </p>
            <button
              onClick={() => setShowPrivacy(false)}
              className="bg-amber-200 text-amber-950 font-bold py-2 rounded-xl mt-1"
            >
              Zavřít
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
