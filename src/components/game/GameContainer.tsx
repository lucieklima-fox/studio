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
  generateRandomNote
} from '@/lib/music-logic';
import { musicSystemConfig } from '@/lib/music-system';
import { Music, Keyboard, GraduationCap, RotateCcw, Trophy, PlayCircle, Volume2, Sparkles, LayoutDashboard, BrainCircuit, Loader2, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth, useFirestore, useCollection } from '@/firebase';
import { collection, doc, query, orderBy, limit } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Progress } from '@/components/ui/progress';
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

  // Core State
  const [mode, setMode] = useState<GameMode>('study');
  const [clef, setClef] = useState<'treble' | 'bass'>('treble');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [currentNote, setCurrentNote] = useState<MusicalNote | null>(null);
  const [status, setStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedAccidental, setSelectedAccidental] = useState<Accidental>('natural');

  // Study Mode State
  const [studyMidi, setStudyMidi] = useState(60); // Start at Middle C

  // Challenge Mode State
  const [isTestActive, setIsTestActive] = useState(false);
  const [testIndex, setTestIndex] = useState(0);
  const [testCorrectCount, setTestCorrectCount] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // AI & Stats State
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [aiLesson, setAiLesson] = useState<PersonalizedPracticeSessionGeneratorOutput | null>(null);

  // Fetch recent sessions
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
      if (clef === 'treble') return midi >= 60; 
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
        midi: noteToMidi(currentNote)
      }
    }, { merge: true });
  }, [user, db, currentNote, mode, clef, isTestActive]);

  const handleNoteClick = useCallback((noteId: string) => {
    if (status || mode === 'study') return;
    playNote(noteId);
    if (currentNote) {
      const correctMidi = noteToMidi(currentNote);
      const pianoNotes = musicSystemConfig.keyboardMidis;
      const match = pianoNotes.find(m => noteToTone(midiToNote(m)) === noteId);
      
      const correct = match === correctMidi;
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
    <div className="container mx-auto max-w-5xl py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-3xl shadow-sm border-2 border-primary/20">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-3 rounded-2xl shadow-lg">
            <Music className="text-white h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Melody Maestro</h1>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
               Mode: <span className="text-primary capitalize">{mode}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2 items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-2">
                   <LayoutDashboard className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[400px] sm:w-[540px] rounded-l-[3rem]">
                <SheetHeader>
                  <SheetTitle className="text-2xl font-bold">Your Progress</SheetTitle>
                  <SheetDescription>Track your musical journey</SheetDescription>
                </SheetHeader>
                <div className="py-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary/10 p-4 rounded-2xl text-center">
                       <p className="text-xs font-bold uppercase text-primary">Lifetime Score</p>
                       <p className="text-2xl font-black">{score}</p>
                    </div>
                    <div className="bg-accent/10 p-4 rounded-2xl text-center">
                       <p className="text-xs font-bold uppercase text-accent">Recent Accuracy</p>
                       <p className="text-2xl font-black">{accuracy}%</p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button 
                variant="outline" 
                size="icon" 
                className="h-14 w-14 rounded-2xl border-2"
                onClick={() => {setScore(0); setAttempts(0); generateNextRound();}}
            >
                <RotateCcw className="h-6 w-6" />
            </Button>

            <div className="text-center px-6 py-3 bg-primary/10 rounded-2xl hidden sm:block min-w-[120px]">
                <p className="text-xs font-bold text-primary uppercase tracking-wider">Mastery</p>
                <p className="text-3xl font-black text-primary">{accuracy}%</p>
            </div>
        </div>
      </div>

      {/* Mode Tabs */}
      <Tabs value={mode} onValueChange={(v) => { if (isTestActive) return; setMode(v as GameMode); }} className="w-full">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8 overflow-x-auto pb-2">
          <TabsList className="flex h-auto p-2 bg-white rounded-3xl border-2 border-primary/10 gap-2 w-full lg:w-auto">
            <TabsTrigger value="study" className="flex-1 py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white gap-2 font-bold whitespace-nowrap">
              <BookOpen size={18} /> Studium
            </TabsTrigger>
            <TabsTrigger value="identify" className="flex-1 py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white gap-2 font-bold whitespace-nowrap">
              <GraduationCap size={18} /> Poznávání
            </TabsTrigger>
            <TabsTrigger value="find" className="flex-1 py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white gap-2 font-bold whitespace-nowrap">
              <Keyboard size={18} /> Klavír
            </TabsTrigger>
            <TabsTrigger value="challenge" className="flex-1 py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white gap-2 font-bold whitespace-nowrap">
              <Trophy size={18} /> Výzva
            </TabsTrigger>
          </TabsList>

          <Button 
            variant="secondary" 
            className="h-16 px-8 rounded-3xl gap-3 font-bold shadow-lg border-2 border-primary/10"
            onClick={() => {
              if (recentSessions) {
                const struggles = recentSessions.filter(s => s.correctCount === 0);
                const challengingNotes = struggles.map(s => `${s.noteDetails?.letter}${s.noteDetails?.octave}`);
                const challengingClefs = struggles.map(s => s.clefSetting as 'treble' | 'bass');
                setIsGeneratingLesson(true);
                generatePersonalizedPracticeSession({
                  challengingNotes: [...new Set(challengingNotes)],
                  challengingClefs: [...new Set(challengingClefs)],
                  recentPerformanceSummary: "User is studying Treble and Bass ranges."
                }).then(setAiLesson).finally(() => setIsGeneratingLesson(false));
              }
            }}
            disabled={isGeneratingLesson || (recentSessions?.length ?? 0) < 3}
          >
            {isGeneratingLesson ? <Loader2 className="animate-spin" /> : <BrainCircuit className="text-primary" />}
            AI Kouč
          </Button>
        </div>

        <div className="relative min-h-[500px]">
          <FeedbackOverlay 
            status={status} 
            onFinished={() => { if (!isTestActive) { setStatus(null); generateNextRound(); } }} 
          />

          {mode === 'study' && (
            <Card className="rounded-[3rem] border-none shadow-2xl bg-white p-10 space-y-10">
              <div className="text-center space-y-3">
                <h2 className="text-4xl font-black text-primary tracking-tight">Interaktivní Stupnice</h2>
                <p className="text-xl text-muted-foreground font-medium">Sledujte tóny od C4 do C7 a učte se jejich názvy.</p>
              </div>
              
              <div className="bg-muted/30 p-10 rounded-[2.5rem] border-2 border-dashed border-primary/30 flex items-center justify-center min-h-[340px]">
                {currentNote && <StaffRenderer clef={clef} note={currentNote} showName className="h-full border-none shadow-none bg-transparent" />}
              </div>

              <div className="space-y-8 max-w-3xl mx-auto">
                <div className="flex justify-between items-center gap-4">
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={() => setStudyMidi(m => Math.max(60, m - 1))}>
                    <ChevronLeft size={24} />
                  </Button>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between font-bold text-sm px-2 text-muted-foreground uppercase tracking-widest">
                       <span>C4</span>
                       <span>C7</span>
                    </div>
                    <input 
                      type="range" 
                      min="60" 
                      max="96" 
                      value={studyMidi} 
                      onChange={(e) => {
                        const m = parseInt(e.target.value);
                        setStudyMidi(m);
                        setClef(m < 60 ? 'bass' : 'treble');
                        playNote(noteToTone(midiToNote(m)));
                      }}
                      className="w-full h-4 bg-primary/20 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={() => setStudyMidi(m => Math.min(96, m + 1))}>
                    <ChevronRight size={24} />
                  </Button>
                </div>
                
                <div className="flex justify-center gap-4">
                   <Button variant={clef === 'treble' ? 'default' : 'outline'} onClick={() => setClef('treble')} className="h-12 px-8 rounded-2xl font-bold shadow-sm">Houslový klíč</Button>
                   <Button variant={clef === 'bass' ? 'default' : 'outline'} onClick={() => setClef('bass')} className="h-12 px-8 rounded-2xl font-bold shadow-sm">Basový klíč</Button>
                </div>
              </div>
            </Card>
          )}

          {(mode === 'identify' || (mode === 'challenge' && isTestActive)) && (
            <div className="space-y-6">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                <CardContent className="p-8 space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                          {isTestActive ? `Nota ${testIndex + 1} z 50` : `Jak se jmenuje tato nota?`}
                      </h2>
                      
                      <div className="flex gap-2">
                        {currentNote && (
                          <Button variant="outline" size="sm" className="rounded-xl font-bold gap-2" onClick={() => playNote(noteToTone(currentNote))}>
                            <Volume2 size={16} /> Poslechnout
                          </Button>
                        )}
                        {!isTestActive && (
                          <div className="flex bg-muted p-1 rounded-xl">
                              <Button variant={clef === 'treble' ? 'default' : 'ghost'} onClick={() => setClef('treble')} className="rounded-lg font-bold h-8 px-3 text-xs">Treble</Button>
                              <Button variant={clef === 'bass' ? 'default' : 'ghost'} onClick={() => setClef('bass')} className="rounded-lg font-bold h-8 px-3 text-xs">Bass</Button>
                          </div>
                        )}
                      </div>
                  </div>
                  
                  {currentNote && <StaffRenderer clef={currentNote.clef} note={currentNote} />}

                  <div className="space-y-6">
                    <div className="flex justify-center gap-3">
                      <Button variant={selectedAccidental === 'natural' ? 'default' : 'outline'} onClick={() => setSelectedAccidental('natural')} className="rounded-xl px-6 font-bold">Natural ♮</Button>
                      <Button variant={selectedAccidental === 'sharp' ? 'default' : 'outline'} onClick={() => setSelectedAccidental('sharp')} className="rounded-xl px-6 font-bold">Sharp ♯</Button>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                      {(['C', 'D', 'E', 'F', 'G', 'A', 'B'] as NoteLetter[]).map((letter) => (
                        <Button 
                          key={letter} 
                          onClick={() => handleNameClick(letter)}
                          className="h-20 text-2xl font-black rounded-2xl transition-all shadow-md"
                          variant="secondary"
                          disabled={status !== null}
                        >
                          {letter}{selectedAccidental === 'sharp' ? '♯' : ''}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <TabsContent value="find" className="mt-0">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 text-center space-y-8">
               <h2 className="text-2xl font-bold">Najdi tuto klávesu:</h2>
                <div className="py-12 bg-primary/5 rounded-[2rem] border-4 border-dashed border-primary/20">
                    <span className="text-8xl font-black text-primary">
                      {currentNote?.letter}{currentNote?.accidental === 'sharp' ? '♯' : ''}
                      <span className="text-4xl text-primary/60 ml-2">{currentNote?.octave}</span>
                    </span>
                </div>
            </Card>
          </TabsContent>

          <TabsContent value="challenge" className="mt-0">
            {!isTestActive && (
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-12 text-center space-y-8">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
                    <Trophy size={48} />
                </div>
                <h2 className="text-4xl font-black">Mistrovství 50 Not</h2>
                <p className="text-xl text-muted-foreground max-w-lg mx-auto">Kompletní test od C2 do C7.</p>
                <Button onClick={() => { setIsTestActive(true); setTestIndex(0); setTestCorrectCount(0); }} size="lg" className="rounded-2xl h-20 px-12 text-2xl font-bold shadow-xl">
                  Spustit Test
                </Button>
              </Card>
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* Piano */}
      <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-t-8 border-primary overflow-x-auto">
          <PianoKeyboard activeNotes={activeNotes} onNoteClick={handleNoteClick} />
      </div>

      {/* AI Lesson Dialog */}
      <AlertDialog open={!!aiLesson} onOpenChange={() => setAiLesson(null)}>
        <AlertDialogContent className="rounded-[2.5rem] p-8 max-w-md">
          <AlertDialogHeader className="items-center text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
               <BrainCircuit size={40} />
            </div>
            <AlertDialogTitle className="text-3xl font-black">AI Kouč radí</AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              {aiLesson?.instructions}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center mt-6">
            <AlertDialogAction onClick={() => { 
              setAiLesson(null);
              setMode('identify');
              if (aiLesson?.clef === 'bass') setClef('bass');
              else if (aiLesson?.clef === 'treble') setClef('treble');
            }} className="rounded-xl h-14 w-full text-lg font-bold">
              Rozumím!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Results Dialog */}
      <AlertDialog open={showResults} onOpenChange={setShowResults}>
        <AlertDialogContent className="rounded-[2.5rem] p-8 max-w-md">
          <AlertDialogHeader className="items-center text-center space-y-4">
            <Trophy size={60} className="text-green-500" />
            <AlertDialogTitle className="text-3xl font-black">Test dokončen!</AlertDialogTitle>
            <AlertDialogDescription className="text-xl text-center">
              Skóre: <span className="font-bold">{testCorrectCount}</span> z 50.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
             <AlertDialogAction onClick={() => { setShowResults(false); setMode('study'); }} className="w-full h-14 rounded-xl">Pokračovat</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
