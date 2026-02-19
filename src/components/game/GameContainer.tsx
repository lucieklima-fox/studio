
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
  noteToMidi
} from '@/lib/music-logic';
import { musicSystemConfig } from '@/lib/music-system';
import { Music, Keyboard, GraduationCap, RotateCcw, Trophy, PlayCircle, Volume2, Sparkles, LayoutDashboard, BrainCircuit, Loader2 } from 'lucide-react';
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

type GameMode = 'identify' | 'find' | 'challenge';

export default function GameContainer() {
  const { playNote } = usePiano();
  const { user, auth } = useAuth();
  const db = useFirestore();

  // Core State
  const [mode, setMode] = useState<GameMode>('identify');
  const [clef, setClef] = useState<'treble' | 'bass'>('treble');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [currentNote, setCurrentNote] = useState<MusicalNote | null>(null);
  const [status, setStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedAccidental, setSelectedAccidental] = useState<Accidental>('natural');

  // Challenge Mode State
  const [isTestActive, setIsTestActive] = useState(false);
  const [testIndex, setTestIndex] = useState(0);
  const [testCorrectCount, setTestCorrectCount] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // AI & Stats State
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [aiLesson, setAiLesson] = useState<PersonalizedPracticeSessionGeneratorOutput | null>(null);

  // Fetch recent sessions for AI context and Dashboard
  const sessionsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'practiceSessions'),
      orderBy('startTime', 'desc'),
      limit(20)
    );
  }, [db, user]);
  const { data: recentSessions } = useCollection(sessionsQuery);

  // Onboarding: ensure guest sign-in
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

    const randomIndex = Math.floor(Math.random() * pool.length);
    const newNote = midiToNote(pool[randomIndex], clef);
    setCurrentNote(newNote);
    setStatus(null);
  }, [clef, mode, isTestActive, testIndex, challengeNotes]);

  useEffect(() => {
    generateNextRound();
  }, [mode, clef, generateNextRound]);

  const handleAiCoach = async () => {
    if (!recentSessions) return;
    setIsGeneratingLesson(true);
    
    try {
      const struggles = recentSessions.filter(s => s.correctCount === 0);
      const challengingNotes = struggles.map(s => `${s.noteDetails?.letter}${s.noteDetails?.octave}`);
      const challengingClefs = struggles.map(s => s.clefSetting as 'treble' | 'bass');

      const lesson = await generatePersonalizedPracticeSession({
        challengingNotes: [...new Set(challengingNotes)],
        challengingClefs: [...new Set(challengingClefs)],
        recentPerformanceSummary: `User has done ${recentSessions.length} sessions recently with ${recentSessions.filter(s => s.correctCount > 0).length} correct.`
      });
      setAiLesson(lesson);
    } catch (e) {
      console.error("AI Lesson generation failed", e);
    } finally {
      setIsGeneratingLesson(false);
    }
  };

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
    if (status) return;
    playNote(noteId);
    if (currentNote) {
      const correctMidi = noteToMidi(currentNote);
      // Simple tone to midi approx (doesn't need to be perfect for click)
      const correct = noteToTone(currentNote) === noteId;
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
  }, [currentNote, status, playNote, logSession, isTestActive]);

  const handleNameClick = (letter: NoteLetter) => {
    if (!currentNote || status) return;
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
  const activeNotes = status === 'correct' && currentNote ? [noteToTone(currentNote)] : [];

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
               Learning Mode: <span className="text-primary capitalize">{mode}</span>
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
                  
                  <div className="space-y-4">
                    <h3 className="font-bold flex items-center gap-2 text-lg">
                      <Sparkles className="text-primary" size={18} /> Recent Sessions
                    </h3>
                    <div className="space-y-2">
                      {recentSessions?.map(s => (
                        <div key={s.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-xl border">
                          <div className="flex gap-3 items-center">
                             <div className={s.correctCount > 0 ? "text-green-500" : "text-destructive"}>
                               {s.correctCount > 0 ? "✓" : "✗"}
                             </div>
                             <span className="font-bold">{s.noteDetails?.letter}{s.noteDetails?.accidental === 'sharp' ? '#' : ''}{s.noteDetails?.octave}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button 
                variant="outline" 
                size="icon" 
                className="h-14 w-14 rounded-2xl border-2 hover:bg-muted"
                onClick={() => {setScore(0); setAttempts(0); setTestIndex(0); generateNextRound();}}
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
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <TabsList className="grid grid-cols-3 h-auto p-2 bg-white rounded-3xl border-2 border-primary/10 gap-2 w-full max-w-2xl">
            <TabsTrigger value="identify" className="py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white gap-2 text-lg font-bold">
              <GraduationCap size={20} /> Identify
            </TabsTrigger>
            <TabsTrigger value="find" className="py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white gap-2 text-lg font-bold">
              <Keyboard size={20} /> Piano
            </TabsTrigger>
            <TabsTrigger value="challenge" className="py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white gap-2 text-lg font-bold">
              <Trophy size={20} /> Challenge
            </TabsTrigger>
          </TabsList>

          <Button 
            variant="secondary" 
            className="h-16 px-8 rounded-3xl gap-3 font-bold text-lg shadow-lg border-2 border-primary/10 hover:border-primary/30"
            onClick={handleAiCoach}
            disabled={isGeneratingLesson || (recentSessions?.length ?? 0) < 3}
          >
            {isGeneratingLesson ? <Loader2 className="animate-spin" /> : <BrainCircuit className="text-primary" />}
            AI Coach
          </Button>
        </div>

        <div className="relative overflow-hidden min-h-[440px]">
          <FeedbackOverlay 
            status={status} 
            message={status === 'incorrect' ? `Try again!` : `Correct!`} 
            onFinished={() => { if (!isTestActive) { setStatus(null); generateNextRound(); } }} 
          />

          {(mode === 'identify' || (mode === 'challenge' && isTestActive)) && (
            <div className="space-y-6">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                <CardContent className="p-8 space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                          {isTestActive ? <Trophy className="text-primary animate-bounce" /> : <GraduationCap className="text-primary" />}
                          {isTestActive ? `Note ${testIndex + 1} of 50` : `Name the note:`}
                      </h2>
                      
                      <div className="flex gap-2">
                        {currentNote && (
                          <Button variant="outline" size="sm" className="rounded-xl font-bold gap-2" onClick={() => playNote(noteToTone(currentNote))}>
                            <Volume2 size={16} /> Listen
                          </Button>
                        )}
                        {!isTestActive && (
                          <div className="flex bg-muted p-1 rounded-xl">
                              <Button variant={clef === 'treble' ? 'default' : 'ghost'} onClick={() => setClef('treble')} className="rounded-lg font-bold h-8 px-3 text-xs">Treble</Button>
                              <Button variant={clef === 'bass' ? 'default' : 'ghost'} onClick={() => setClef('bass')} className="rounded-lg font-bold h-8 px-3 text-xs">Bass</Button>
                          </div>
                        )}
                      </div>

                      {isTestActive && (
                        <div className="w-full sm:w-48 space-y-2">
                           <Progress value={(testIndex / 50) * 100} className="h-2" />
                        </div>
                      )}
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
                          className="h-20 text-2xl font-black rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-md"
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

          <TabsContent value="find" className="mt-0 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 text-center space-y-8">
               <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <Keyboard className="text-primary" /> Find this key on the piano:
                </h2>
                <div className="py-12 bg-primary/5 rounded-[2rem] border-4 border-dashed border-primary/20">
                    <span className="text-8xl font-black text-primary">
                      {currentNote?.letter}{currentNote?.accidental === 'sharp' ? '♯' : ''}
                      <span className="text-4xl text-primary/60 ml-2">{currentNote?.octave}</span>
                    </span>
                </div>
            </Card>
          </TabsContent>

          <TabsContent value="challenge" className="mt-0 space-y-6">
            {!isTestActive && (
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-12 text-center space-y-8">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
                    <Trophy size={48} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-black">50 Note Mastery</h2>
                  <p className="text-xl text-muted-foreground max-w-lg mx-auto">
                    A comprehensive assessment across the full range (**C2 to C7**). Can you identify every note perfectly?
                  </p>
                </div>
                <Button onClick={() => { setTestIndex(0); setTestCorrectCount(0); setIsTestActive(true); setMode('challenge'); }} size="lg" className="rounded-2xl h-20 px-12 text-2xl font-bold shadow-xl gap-3">
                  <PlayCircle size={32} /> Start Assessment
                </Button>
              </Card>
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* Piano */}
      <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-t-8 border-primary">
          <PianoKeyboard activeNotes={activeNotes} onNoteClick={handleNoteClick} />
      </div>

      {/* AI Lesson Dialog */}
      <AlertDialog open={!!aiLesson} onOpenChange={() => setAiLesson(null)}>
        <AlertDialogContent className="rounded-[2.5rem] p-8 max-w-md">
          <AlertDialogHeader className="items-center text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
               <BrainCircuit size={40} />
            </div>
            <AlertDialogTitle className="text-3xl font-black">AI Recommendations</AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              {aiLesson?.instructions}
              <div className="mt-4 p-4 bg-muted rounded-2xl text-left">
                <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Target Notes</p>
                <div className="flex flex-wrap gap-2">
                  {aiLesson?.focusNotes.map(n => <span key={n} className="px-3 py-1 bg-white rounded-lg font-bold border">{n}</span>)}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center mt-6">
            <AlertDialogAction onClick={() => { 
              setAiLesson(null);
              // Set mode and clef based on AI suggestion
              if (aiLesson?.clef === 'bass') setClef('bass');
              else if (aiLesson?.clef === 'treble') setClef('treble');
              setMode('identify');
            }} className="rounded-xl h-14 w-full text-lg font-bold">
              Let's Practice!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Results Dialog */}
      <AlertDialog open={showResults} onOpenChange={setShowResults}>
        <AlertDialogContent className="rounded-[2.5rem] p-8 max-w-md">
          <AlertDialogHeader className="items-center text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
               <Trophy size={40} />
            </div>
            <AlertDialogTitle className="text-3xl font-black">Test Complete!</AlertDialogTitle>
            <AlertDialogDescription className="text-xl">
              You scored <span className="font-bold text-foreground">{testCorrectCount}</span> out of <span className="font-bold text-foreground">50</span>.
              <br />
              <span className="text-primary font-black text-4xl mt-3 block">
                {Math.round((testCorrectCount / 50) * 100)}% Accuracy
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center mt-6">
            <AlertDialogAction onClick={() => {setShowResults(false); setMode('identify');}} className="rounded-xl h-14 w-full text-lg font-bold">
              Continue Learning
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
