
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
  generateRandomNote, 
  isCorrectAnswer, 
  noteToTone, 
  toneToMidi,
  NoteLetter, 
  Accidental,
  midiToNote,
  noteToMidi
} from '@/lib/music-logic';
import { musicSystemConfig } from '@/lib/music-system';
import { Music, Keyboard, GraduationCap, RotateCcw, Award, Sparkles, Trophy, PlayCircle, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type GameMode = 'identify' | 'find' | 'challenge';

export default function GameContainer() {
  const { playNote } = usePiano();
  const { user } = useAuth();
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

  // Generate a random but fair sequence for the 50-note mastery challenge
  const challengeNotes = useMemo(() => {
    const sequence: MusicalNote[] = [];
    const pool = musicSystemConfig.allowedStaffMidis;
    
    // We want a mix of notes across the entire C2-C7 range
    for (let i = 0; i < 50; i++) {
      const midi = pool[Math.floor(Math.random() * pool.length)];
      // Automatically split clef at Middle C (60)
      const targetClef = midi < 60 ? 'bass' : 'treble';
      sequence.push(midiToNote(midi, targetClef));
    }
    return sequence;
  }, [isTestActive]); // Re-generate sequence only when starting a new test

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
      if (clef === 'treble') return midi >= 60; // Middle C and up for treble
      return midi <= 60; // Middle C and down for bass
    });

    const newNote = generateRandomNote(clef, pool);
    setCurrentNote(newNote);
    setStatus(null);
  }, [clef, mode, isTestActive, testIndex, challengeNotes]);

  useEffect(() => {
    generateNextRound();
  }, [mode, clef, generateNextRound]);

  const startChallenge = () => {
    setTestIndex(0);
    setTestCorrectCount(0);
    setIsTestActive(true);
    setMode('challenge');
  };

  const logSession = useCallback((isCorrect: boolean) => {
    if (!user || !db || !currentNote) return;

    const sessionRef = doc(collection(db, 'users', user.uid, 'practiceSessions'));
    const now = new Date();
    
    setDocumentNonBlocking(sessionRef, {
      id: sessionRef.id,
      userId: user.uid,
      mode: mode === 'challenge' ? '50_note_challenge' : mode,
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
  }, [user, db, currentNote, mode, clef]);

  const handleNoteClick = useCallback((noteId: string) => {
    if (status) return;
    
    playNote(noteId);

    if (currentNote) {
      const pressedMidi = toneToMidi(noteId);
      const correctMidi = noteToMidi(currentNote);

      const correct = pressedMidi === correctMidi;
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

      if (isTestActive) {
        setTimeout(() => {
           setTestIndex(i => i + 1);
        }, 800);
      }
    }
  }, [currentNote, status, playNote, logSession, isTestActive]);

  const handleNameClick = (letter: NoteLetter) => {
    if (!currentNote || status) return;
    
    const correct = isCorrectAnswer(currentNote, { 
      letter, 
      octave: currentNote.octave, 
      accidental: selectedAccidental 
    });

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

    if (isTestActive) {
      setTimeout(() => {
         setTestIndex(i => i + 1);
      }, 800);
    }
  };

  const accuracy = attempts > 0 ? Math.round((score / (attempts * 10)) * 100) : 100;
  const activeNotes = status === 'correct' && currentNote ? [noteToTone(currentNote)] : [];

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-3xl shadow-sm border-2 border-primary/20">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-3 rounded-2xl shadow-lg">
            <Music className="text-white h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Melody Maestro</h1>
            <p className="text-muted-foreground font-medium">Musical Mastery for Kids</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
            <div className="text-center px-6 py-3 bg-primary/10 rounded-2xl">
                <p className="text-xs font-bold text-primary uppercase tracking-wider">Points</p>
                <p className="text-3xl font-black text-primary">{score}</p>
            </div>
            <div className="text-center px-6 py-3 bg-accent/10 rounded-2xl">
                <p className="text-xs font-bold text-accent uppercase tracking-wider">Accuracy</p>
                <p className="text-3xl font-black text-accent">{accuracy}%</p>
            </div>
            <Button 
                variant="outline" 
                size="icon" 
                className="h-14 w-14 rounded-2xl border-2 hover:bg-muted"
                onClick={() => {setScore(0); setAttempts(0); generateNextRound();}}
            >
                <RotateCcw className="h-6 w-6" />
            </Button>
        </div>
      </div>

      {/* Mode Tabs */}
      <Tabs value={mode} onValueChange={(v) => {
        if (isTestActive) return; 
        setMode(v as GameMode);
      }} className="w-full">
        <TabsList className="grid grid-cols-3 h-auto p-2 bg-white rounded-3xl border-2 border-primary/10 gap-2 mb-8 max-w-2xl mx-auto">
          <TabsTrigger value="identify" className="py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white gap-2 text-lg font-bold">
            <GraduationCap size={20} /> Identify Note
          </TabsTrigger>
          <TabsTrigger value="find" className="py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white gap-2 text-lg font-bold">
            <Keyboard size={20} /> Find on Piano
          </TabsTrigger>
          <TabsTrigger value="challenge" className="py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white gap-2 text-lg font-bold">
            <Trophy size={20} /> 50 Note Test
          </TabsTrigger>
        </TabsList>

        <div className="relative overflow-hidden min-h-[420px]">
          <FeedbackOverlay 
            status={status} 
            message={status === 'incorrect' ? `Try again!` : `Correct!`} 
            onFinished={() => {
              if (!isTestActive) {
                setStatus(null); 
                generateNextRound();
              }
            }} 
          />

          {/* Practice Modes */}
          {(mode === 'identify' || (mode === 'challenge' && isTestActive)) && (
            <div className="mt-0 space-y-6">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                <CardContent className="p-8 space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                          {mode === 'challenge' ? <Trophy className="text-primary" /> : <GraduationCap className="text-primary" />}
                          {mode === 'challenge' ? `Question ${testIndex + 1} of 50` : `Name the note on the staff:`}
                      </h2>
                      
                      <div className="flex gap-2">
                        {currentNote && !isTestActive && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl font-bold gap-2"
                            onClick={() => playNote(noteToTone(currentNote))}
                          >
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
                           <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground">
                              <span>Progress</span>
                              <span>{Math.round((testIndex / 50) * 100)}%</span>
                           </div>
                           <Progress value={(testIndex / 50) * 100} className="h-2" />
                        </div>
                      )}
                  </div>
                  
                  {currentNote && <StaffRenderer clef={currentNote.clef} note={currentNote} />}

                  <div className="space-y-6">
                    <div className="flex justify-center gap-3">
                      <Button 
                        variant={selectedAccidental === 'natural' ? 'default' : 'outline'} 
                        onClick={() => setSelectedAccidental('natural')}
                        className="rounded-xl px-6 font-bold"
                      >
                        Natural ♮
                      </Button>
                      <Button 
                        variant={selectedAccidental === 'sharp' ? 'default' : 'outline'} 
                        onClick={() => setSelectedAccidental('sharp')}
                        className="rounded-xl px-6 font-bold"
                      >
                        Sharp ♯
                      </Button>
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
                    <span className="text-8xl font-black text-primary animate-pulse">
                      {currentNote?.letter}{currentNote?.accidental === 'sharp' ? '♯' : ''}
                      <span className="text-4xl text-primary/60 ml-2">{currentNote?.octave}</span>
                    </span>
                </div>
                <div className="flex justify-center gap-4">
                  <Button size="lg" onClick={() => currentNote && playNote(noteToTone(currentNote))} className="rounded-2xl gap-2 h-16 px-8 text-xl font-bold shadow-lg">
                    <Volume2 /> Listen
                  </Button>
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
                <Button onClick={startChallenge} size="lg" className="rounded-2xl h-20 px-12 text-2xl font-bold shadow-xl gap-3">
                  <PlayCircle size={32} /> Start Assessment
                </Button>
              </Card>
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* Keyboard Area */}
      <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-t-8 border-primary">
          <PianoKeyboard 
            activeNotes={activeNotes} 
            onNoteClick={handleNoteClick} 
          />
      </div>

      {/* Results Dialog */}
      <AlertDialog open={showResults} onOpenChange={setShowResults}>
        <AlertDialogContent className="rounded-[2.5rem] p-8">
          <AlertDialogHeader className="items-center text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
               <Award size={40} />
            </div>
            <AlertDialogTitle className="text-3xl font-black">Assessment Complete!</AlertDialogTitle>
            <AlertDialogDescription className="text-xl">
              You correctly identified <span className="font-bold text-foreground">{testCorrectCount}</span> out of <span className="font-bold text-foreground">50</span> notes.
              <br />
              <span className="text-primary font-black text-3xl mt-2 block">
                {Math.round((testCorrectCount / 50) * 100)}% Accuracy
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center mt-6">
            <AlertDialogAction onClick={() => {setShowResults(false); setMode('identify');}} className="rounded-xl h-14 px-8 text-lg font-bold">
              Back to Practice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
