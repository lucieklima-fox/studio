
"use client";

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PianoKeyboard } from '@/components/piano/PianoKeyboard';
import { StaffRenderer } from '@/components/staff/StaffRenderer';
import { FeedbackOverlay } from './FeedbackOverlay';
import { usePiano } from '@/hooks/use-piano';
import { 
  MusicalNote, 
  isCorrectAnswer, 
  noteToTone, 
  NoteLetter, 
  Accidental,
  midiToNote,
  noteToMidi,
  generateRandomNote,
  getCzechNoteName
} from '@/lib/music-logic';
import { musicSystemConfig } from '@/lib/music-system';
import { Music, Keyboard, GraduationCap, RotateCcw, Trophy, Volume2, BrainCircuit, Loader2, BookOpen, ChevronRight, ChevronLeft, LayoutDashboard } from 'lucide-react';
import { useAuth, useFirestore, useCollection } from '@/firebase';
import { collection, doc, query, orderBy, limit } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { generatePersonalizedPracticeSession, PersonalizedPracticeSessionGeneratorOutput } from '@/ai/flows/generate-personalized-practice-session';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type GameMode = 'identify' | 'find' | 'challenge' | 'study';

export default function GameContainer() {
  const { playNote } = usePiano();
  const { user, auth } = useAuth();
  const db = useFirestore();

  const [mode, setMode] = useState<GameMode>('study');
  const [clef, setClef] = useState<'treble' | 'bass'>('treble');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [currentNote, setCurrentNote] = useState<MusicalNote | null>(null);
  const [status, setStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedAccidental, setSelectedAccidental] = useState<Accidental>('natural');
  const [studyMidi, setStudyMidi] = useState(60); 
  const [isTestActive, setIsTestActive] = useState(false);
  const [testIndex, setTestIndex] = useState(0);
  const [testCorrectCount, setTestCorrectCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [aiLesson, setAiLesson] = useState<PersonalizedPracticeSessionGeneratorOutput | null>(null);

  const sessionsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'practiceSessions'),
      orderBy('startTime', 'desc'),
      limit(20)
    );
  }, [db, user]);
  const { data: recentSessions } = useCollection(sessionsQuery);

  useEffect(() => {
    if (!user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, auth]);

  const challengeNotes = useMemo(() => {
    const sequence: MusicalNote[] = [];
    const pool = musicSystemConfig.allowedStaffMidis;
    for (let i = 0; i < 50; i++) {
      const midi = pool[Math.floor(Math.random() * pool.length)];
      const targetClef = midi < 60 ? 'bass' : 'treble';
      sequence.push(midiToNote(midi, targetClef));
    }
    return sequence;
  }, [isTestActive]);

  const generateNextRound = useCallback(() => {
    if (mode === 'study') {
       setCurrentNote(midiToNote(studyMidi, clef));
       return;
    }

    if (mode === 'challenge' && isTestActive) {
      if (testIndex < 50) {
        const nextNote = challengeNotes[testIndex];
        setCurrentNote(nextNote);
        setClef(nextNote.clef);
      } else {
        setIsTestActive(false);
        setShowResults(true);
      }
      setStatus(null);
      return;
    }

    const pool = musicSystemConfig.allowedStaffMidis.filter(midi => {
      if (clef === 'treble') return midi >= 48; 
      return midi < 60;
    });

    const newNote = generateRandomNote(clef, pool);
    setCurrentNote(newNote);
    setStatus(null);
  }, [clef, mode, isTestActive, testIndex, challengeNotes, studyMidi]);

  useEffect(() => {
    generateNextRound();
  }, [mode, clef, generateNextRound, studyMidi]);

  const logSession = useCallback((isCorrect: boolean) => {
    if (!user || !db || !currentNote) return;

    const sessionRef = doc(collection(db, 'users', user.uid, 'practiceSessions'));
    const now = new Date();
    
    setDocumentNonBlocking(sessionRef, {
      id: sessionRef.id,
      userId: user.uid,
      mode: isTestActive ? '50_note_challenge' : mode,
      startTime: now.toISOString(),
      endTime: now.toISOString(),
      durationSeconds: 0,
      totalItems: 1,
      correctCount: isCorrect ? 1 : 0,
      incorrectCount: isCorrect ? 0 : 1,
      accuracyPercentage: isCorrect ? 100 : 0,
      clefSetting: clef,
      difficultySetting: 'normal',
      notesPlayedLog: [isCorrect],
      noteDetails: {
        letter: currentNote.letter,
        octave: currentNote.octave,
        accidental: currentNote.accidental,
        clef: currentNote.clef,
        midi: noteToMidi(currentNote),
        czechName: getCzechNoteName(currentNote)
      }
    }, { merge: true });
  }, [user, db, currentNote, mode, clef, isTestActive]);

  const handleNoteClick = useCallback((noteId: string) => {
    if (status || mode === 'study') return;
    playNote(noteId);
    if (currentNote) {
      const match = musicSystemConfig.keyboardMidis.find(m => noteToTone(midiToNote(m)) === noteId);
      
      const correct = match === noteToMidi(currentNote);
      setAttempts(a => a + 1);
      if (correct) {
        setScore(s => s + 10);
        if (isTestActive) setTestCorrectCount(c => c + 1);
        setStatus('correct');
        logSession(true);
      } else {
        setStatus('incorrect');
        logSession(false);
      }
      if (isTestActive) setTimeout(() => setTestIndex(i => i + 1), 800);
    }
  }, [currentNote, status, playNote, logSession, isTestActive, mode]);

  const handleNameClick = (letter: NoteLetter) => {
    if (!currentNote || status || mode === 'study') return;
    const correct = isCorrectAnswer(currentNote, { letter, octave: currentNote.octave, accidental: selectedAccidental });
    setAttempts(a => a + 1);
    if (correct) {
      setScore(s => s + 10);
      if (isTestActive) setTestCorrectCount(c => c + 1);
      setStatus('correct');
      playNote(noteToTone(currentNote));
      logSession(true);
    } else {
      setStatus('incorrect');
      logSession(false);
    }
    if (isTestActive) setTimeout(() => setTestIndex(i => i + 1), 800);
  };

  const accuracy = attempts > 0 ? Math.round((score / (attempts * 10)) * 100) : 100;
  const activeNotes = (status === 'correct' || mode === 'study') && currentNote ? [noteToTone(currentNote)] : [];

  return (
    <div className="container mx-auto max-w-5xl py-4 md:py-8 px-4 space-y-4 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 md:p-6 rounded-3xl shadow-sm border-2 border-primary/20">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-primary p-2 md:p-3 rounded-2xl shadow-lg">
            <Music className="text-white h-6 w-6 md:h-8 md:w-8" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-foreground tracking-tight">Melody Maestro</h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium flex items-center gap-2">
               Mód: <span className="text-primary capitalize">{mode === 'study' ? 'Studium' : mode === 'identify' ? 'Poznávání' : mode === 'find' ? 'Klavír' : 'Výzva'}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2 items-center w-full md:w-auto justify-between md:justify-end">
            <div className="flex gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl border-2">
                     <LayoutDashboard className="h-5 w-5 md:h-6 md:w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85vw] sm:w-[540px] rounded-l-3xl">
                  <SheetHeader>
                    <SheetTitle className="text-2xl font-bold">Tvůj Pokrok</SheetTitle>
                    <SheetDescription>Sleduj svou hudební cestu</SheetDescription>
                  </SheetHeader>
                  <div className="py-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-primary/10 p-4 rounded-2xl text-center">
                         <p className="text-xs font-bold uppercase text-primary">Celkové skóre</p>
                         <p className="text-2xl font-black">{score}</p>
                      </div>
                      <div className="bg-accent/10 p-4 rounded-2xl text-center">
                         <p className="text-xs font-bold uppercase text-accent">Přesnost</p>
                         <p className="text-2xl font-black">{accuracy}%</p>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl border-2"
                  onClick={() => {setScore(0); setAttempts(0); generateNextRound();}}
              >
                  <RotateCcw className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </div>

            <div className="text-center px-4 md:px-6 py-2 md:py-3 bg-primary/10 rounded-xl md:rounded-2xl min-w-[100px]">
                <p className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-wider">Mistrovství</p>
                <p className="text-xl md:text-3xl font-black text-primary">{accuracy}%</p>
            </div>
        </div>
      </div>

      <Tabs value={mode} onValueChange={(v) => { if (isTestActive) return; setMode(v as GameMode); }} className="w-full">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4 md:mb-8">
          <TabsList className="flex h-auto p-1 md:p-2 bg-white rounded-2xl md:rounded-3xl border-2 border-primary/10 gap-1 md:gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar">
            <TabsTrigger value="study" className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white gap-1 md:gap-2 font-bold text-xs md:text-sm whitespace-nowrap">
              <BookOpen size={16} /> Studium
            </TabsTrigger>
            <TabsTrigger value="identify" className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white gap-1 md:gap-2 font-bold text-xs md:text-sm whitespace-nowrap">
              <GraduationCap size={16} /> Poznávání
            </TabsTrigger>
            <TabsTrigger value="find" className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white gap-1 md:gap-2 font-bold text-xs md:text-sm whitespace-nowrap">
              <Keyboard size={16} /> Klavír
            </TabsTrigger>
            <TabsTrigger value="challenge" className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white gap-1 md:gap-2 font-bold text-xs md:text-sm whitespace-nowrap">
              <Trophy size={16} /> Výzva
            </TabsTrigger>
          </TabsList>

          <Button 
            variant="secondary" 
            className="h-12 md:h-16 px-6 md:px-8 rounded-2xl md:rounded-3xl gap-2 md:gap-3 font-bold shadow-lg border-2 border-primary/10 w-full lg:w-auto"
            onClick={() => {
              if (recentSessions) {
                const struggles = recentSessions.filter(s => s.correctCount === 0);
                const challengingNotes = struggles.map(s => `${s.noteDetails?.letter}${s.noteDetails?.octave}`);
                const challengingClefs = struggles.map(s => s.clefSetting as 'treble' | 'bass');
                setIsGeneratingLesson(true);
                generatePersonalizedPracticeSession({
                  challengingNotes: [...new Set(challengingNotes)],
                  challengingClefs: [...new Set(challengingClefs)],
                  recentPerformanceSummary: "Uživatel procvičuje český hudební systém v rozsahu A1-G6."
                }).then(setAiLesson).finally(() => setIsGeneratingLesson(false));
              }
            }}
            disabled={isGeneratingLesson || (recentSessions?.length ?? 0) < 3}
          >
            {isGeneratingLesson ? <Loader2 className="animate-spin" /> : <BrainCircuit className="text-primary h-5 w-5" />}
            AI Kouč
          </Button>
        </div>

        <div className="relative min-h-[300px] md:min-h-[500px]">
          <FeedbackOverlay 
            status={status} 
            onFinished={() => { if (!isTestActive) { setStatus(null); generateNextRound(); } }} 
          />

          {mode === 'study' && (
            <Card className="rounded-3xl md:rounded-[3rem] border-none shadow-xl md:shadow-2xl bg-white p-6 md:p-10 space-y-6 md:space-y-10">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-4xl font-black text-primary tracking-tight">Knihovna Tónů (A1 - g3)</h2>
                <p className="text-sm md:text-xl text-muted-foreground font-medium">Prozkoumej české názvy tónů a jejich polohu v notové osnově.</p>
              </div>
              
              <div className="bg-muted/30 p-4 md:p-10 rounded-2xl md:rounded-[2.5rem] border-2 border-dashed border-primary/30 flex items-center justify-center min-h-[200px] md:min-h-[340px]">
                {currentNote && <StaffRenderer clef={clef} note={currentNote} showName className="h-full border-none shadow-none bg-transparent" />}
              </div>

              <div className="space-y-6 md:space-y-8 max-w-3xl mx-auto">
                <div className="flex justify-between items-center gap-2 md:gap-4">
                  <Button variant="outline" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-full shrink-0" onClick={() => {
                    const next = Math.max(33, studyMidi - 1);
                    setStudyMidi(next);
                  }}>
                    <ChevronLeft size={20} />
                  </Button>
                  <div className="flex-1 space-y-2 md:space-y-4">
                    <div className="flex justify-between font-bold text-[10px] md:text-sm px-2 text-muted-foreground uppercase tracking-widest">
                       <span>A1 (Kontra)</span>
                       <span>g3 (Tříčárkovaná)</span>
                    </div>
                    <input 
                      type="range" 
                      min="33" 
                      max="91" 
                      value={studyMidi} 
                      onChange={(e) => {
                        const m = parseInt(e.target.value);
                        setStudyMidi(m);
                        if (m < 53) setClef('bass');
                        else if (m > 60) setClef('treble');
                        playNote(noteToTone(midiToNote(m)));
                      }}
                      className="w-full h-3 md:h-4 bg-primary/20 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                  <Button variant="outline" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-full shrink-0" onClick={() => {
                    const next = Math.min(91, studyMidi + 1);
                    setStudyMidi(next);
                  }}>
                    <ChevronRight size={20} />
                  </Button>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-2 md:gap-4">
                   <Button variant={clef === 'treble' ? 'default' : 'outline'} onClick={() => setClef('treble')} className="h-10 md:h-12 px-6 md:px-8 rounded-xl md:rounded-2xl font-bold shadow-sm text-xs md:text-base">Houslový klíč</Button>
                   <Button variant={clef === 'bass' ? 'default' : 'outline'} onClick={() => setClef('bass')} className="h-10 md:h-12 px-6 md:px-8 rounded-xl md:rounded-2xl font-bold shadow-sm text-xs md:text-base">Basový klíč</Button>
                </div>
              </div>
            </Card>
          )}

          {(mode === 'identify' || (mode === 'challenge' && isTestActive)) && (
            <div className="space-y-4 md:space-y-6">
              <Card className="rounded-3xl md:rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                <CardContent className="p-4 md:p-8 space-y-4 md:space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <h2 className="text-lg md:text-2xl font-bold flex items-center gap-2 text-center">
                          {isTestActive ? `Nota ${testIndex + 1} z 50` : `Jak se jmenuje tato nota?`}
                      </h2>
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        {currentNote && (
                          <Button variant="outline" size="sm" className="flex-1 sm:flex-none rounded-xl font-bold gap-2 text-xs" onClick={() => playNote(noteToTone(currentNote))}>
                            <Volume2 size={14} /> Poslechnout
                          </Button>
                        )}
                        {!isTestActive && (
                          <div className="flex bg-muted p-1 rounded-xl flex-1 sm:flex-none">
                              <Button variant={clef === 'treble' ? 'default' : 'ghost'} onClick={() => setClef('treble')} className="flex-1 rounded-lg font-bold h-8 px-3 text-[10px]">Treble</Button>
                              <Button variant={clef === 'bass' ? 'default' : 'ghost'} onClick={() => setClef('bass')} className="flex-1 rounded-lg font-bold h-8 px-3 text-[10px]">Bass</Button>
                          </div>
                        )}
                      </div>
                  </div>
                  
                  {currentNote && <StaffRenderer clef={currentNote.clef} note={currentNote} className="h-64 md:h-80" />}

                  <div className="space-y-4 md:space-y-6">
                    <div className="flex justify-center gap-2 md:gap-3">
                      <Button variant={selectedAccidental === 'natural' ? 'default' : 'outline'} onClick={() => setSelectedAccidental('natural')} className="flex-1 sm:flex-none rounded-xl px-4 md:px-6 font-bold text-xs">♮ Natural</Button>
                      <Button variant={selectedAccidental === 'sharp' ? 'default' : 'outline'} onClick={() => setSelectedAccidental('sharp')} className="flex-1 sm:flex-none rounded-xl px-4 md:px-6 font-bold text-xs">♯ Sharp</Button>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 md:gap-3">
                      {(['C', 'D', 'E', 'F', 'G', 'A', 'B'] as NoteLetter[]).map((letter) => (
                        <Button 
                          key={letter} 
                          onClick={() => handleNameClick(letter)}
                          className="h-14 md:h-20 text-lg md:text-2xl font-black rounded-xl md:rounded-2xl transition-all shadow-md"
                          variant="secondary"
                          disabled={status !== null}
                        >
                          {letter === 'B' ? 'H' : letter}{selectedAccidental === 'sharp' ? '♯' : ''}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <TabsContent value="find" className="mt-0">
            <Card className="rounded-3xl md:rounded-[2.5rem] border-none shadow-xl bg-white p-6 md:p-8 text-center space-y-6 md:space-y-8">
               <h2 className="text-xl md:text-2xl font-bold">Najdi tón na klavíru:</h2>
                <div className="py-8 md:py-12 bg-primary/5 rounded-2xl md:rounded-[2rem] border-4 border-dashed border-primary/20">
                    <span className="text-6xl md:text-8xl font-black text-primary">
                      {currentNote && getCzechNoteName(currentNote)}
                    </span>
                    {currentNote && (
                      <div className="mt-4 text-primary/60 font-bold uppercase tracking-widest">
                        {musicSystemConfig.czechOctaveLabels[currentNote.octave]} oktáva
                      </div>
                    )}
                </div>
            </Card>
          </TabsContent>

          <TabsContent value="challenge" className="mt-0">
            {!isTestActive && (
              <Card className="rounded-3xl md:rounded-[2.5rem] border-none shadow-xl bg-white p-8 md:p-12 text-center space-y-6 md:space-y-8">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
                    <Trophy className="w-8 h-8 md:w-12 md:h-12" />
                </div>
                <h2 className="text-2xl md:text-4xl font-black">Mistrovství Oktáv</h2>
                <p className="text-sm md:text-xl text-muted-foreground max-w-lg mx-auto">Kompletní test od A1 do G6. Zvládneš to?</p>
                <Button onClick={() => { setIsTestActive(true); setTestIndex(0); setTestCorrectCount(0); }} size="lg" className="w-full sm:w-auto rounded-xl md:rounded-2xl h-16 md:h-20 px-8 md:px-12 text-lg md:text-2xl font-bold shadow-xl">
                  Spustit Test
                </Button>
              </Card>
            )}
          </TabsContent>
        </div>
      </Tabs>

      <div className="bg-white p-4 md:p-8 rounded-3xl md:rounded-[3rem] shadow-2xl border-t-4 md:border-t-8 border-primary overflow-x-auto no-scrollbar">
          <PianoKeyboard activeNotes={activeNotes} onNoteClick={handleNoteClick} />
      </div>

      <AlertDialog open={!!aiLesson} onOpenChange={() => setAiLesson(null)}>
        <AlertDialogContent className="rounded-3xl p-6 md:p-8 max-w-[90vw] md:max-w-md">
          <AlertDialogHeader className="items-center text-center space-y-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
               <BrainCircuit className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <AlertDialogTitle className="text-xl md:text-3xl font-black">AI Kouč radí</AlertDialogTitle>
            <AlertDialogDescription className="text-sm md:text-lg">
              {aiLesson?.instructions}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center mt-6">
            <AlertDialogAction onClick={() => { 
              setAiLesson(null);
              setMode('identify');
              if (aiLesson?.clef === 'bass') setClef('bass');
              else if (aiLesson?.clef === 'treble') setClef('treble');
            }} className="rounded-xl h-12 md:h-14 w-full text-base md:text-lg font-bold">
              Rozumím!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResults} onOpenChange={setShowResults}>
        <AlertDialogContent className="rounded-3xl p-6 md:p-8 max-w-[90vw] md:max-w-md">
          <AlertDialogHeader className="items-center text-center space-y-4">
            <div className="flex items-center justify-center text-green-500">
               <Trophy className="w-12 h-12 md:w-16 md:h-16" />
            </div>
            <AlertDialogTitle className="text-xl md:text-3xl font-black">Test dokončen!</AlertDialogTitle>
            <AlertDialogDescription className="text-lg md:text-xl text-center">
              Skóre: <span className="font-bold">{testCorrectCount}</span> z 50.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
             <AlertDialogAction onClick={() => { setShowResults(false); setMode('study'); }} className="w-full h-12 md:h-14 rounded-xl">Pokračovat</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
