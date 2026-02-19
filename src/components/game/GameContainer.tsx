"use client";

import React, { useState, useCallback, useEffect } from 'react';
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
  NoteLetter, 
  Accidental 
} from '@/lib/music-logic';
import { Sparkles, Music, Keyboard, GraduationCap, RotateCcw, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAuth, useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

type GameMode = 'identify' | 'find';

export default function GameContainer() {
  const { playNote } = usePiano();
  const { user } = useAuth();
  const db = useFirestore();

  const [mode, setMode] = useState<GameMode>('identify');
  const [clef, setClef] = useState<'treble' | 'bass'>('treble');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [currentNote, setCurrentNote] = useState<MusicalNote | null>(null);
  const [status, setStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedAccidental, setSelectedAccidental] = useState<Accidental>('natural');

  // Initialize first game
  useEffect(() => {
    generateNextRound();
  }, [mode, clef]);

  const generateNextRound = useCallback(() => {
    const newNote = generateRandomNote(clef, true);
    setCurrentNote(newNote);
    setStatus(null);
  }, [clef]);

  const logSession = useCallback((isCorrect: boolean) => {
    if (!user || !db || !currentNote) return;

    const sessionRef = doc(collection(db, 'users', user.uid, 'practiceSessions'));
    const now = new Date();
    
    setDocumentNonBlocking(sessionRef, {
      id: sessionRef.id,
      userId: user.uid,
      mode,
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
        clef: currentNote.clef
      }
    }, { merge: true });
  }, [user, db, currentNote, mode, clef]);

  const handleNoteClick = useCallback((noteId: string) => {
    if (status) return;
    
    // noteId format "C4" or "C#4"
    const letter = noteId.charAt(0) as NoteLetter;
    const isSharp = noteId.includes('#');
    const accidental: Accidental = isSharp ? 'sharp' : 'natural';
    const octave = parseInt(noteId.slice(-1));

    playNote(noteId);

    if (currentNote) {
      const correct = isCorrectAnswer(currentNote, { letter, octave, accidental });
      setAttempts(a => a + 1);
      if (correct) {
        setScore(s => s + 10);
        setStatus('correct');
        logSession(true);
      } else {
        setStatus('incorrect');
        logSession(false);
      }
    }
  }, [currentNote, status, playNote, logSession]);

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
      setStatus('correct');
      playNote(noteToTone(currentNote));
      logSession(true);
    } else {
      setStatus('incorrect');
      logSession(false);
    }
  };

  const accuracy = attempts > 0 ? Math.round((score / (attempts * 10)) * 100) : 100;

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-3xl shadow-sm border-2 border-primary/20">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-3 rounded-2xl shadow-lg">
            <Music className="text-white h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Melody Maestro</h1>
            <p className="text-muted-foreground font-medium">Learn notes with precision!</p>
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

      <Tabs value={mode} onValueChange={(v) => setMode(v as GameMode)} className="w-full">
        <TabsList className="grid grid-cols-2 h-auto p-2 bg-white rounded-3xl border-2 border-primary/10 gap-2 mb-8 max-w-md mx-auto">
          <TabsTrigger value="identify" className="py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white gap-2 text-lg font-bold">
            <GraduationCap size={20} /> Name Note
          </TabsTrigger>
          <TabsTrigger value="find" className="py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white gap-2 text-lg font-bold">
            <Keyboard size={20} /> Find Key
          </TabsTrigger>
        </TabsList>

        <div className="relative overflow-hidden min-h-[420px]">
          <FeedbackOverlay 
            status={status} 
            message={status === 'incorrect' ? `Try again!` : `Correct!`} 
            onFinished={() => {setStatus(null); generateNextRound();}} 
          />

          <TabsContent value="identify" className="mt-0 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
              <CardContent className="p-8 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <GraduationCap className="text-primary" /> What's this note?
                    </h2>
                    <div className="flex bg-muted p-1 rounded-xl">
                        <Button variant={clef === 'treble' ? 'default' : 'ghost'} onClick={() => setClef('treble')} className="rounded-lg font-bold">Treble</Button>
                        <Button variant={clef === 'bass' ? 'default' : 'ghost'} onClick={() => setClef('bass')} className="rounded-lg font-bold">Bass</Button>
                    </div>
                </div>
                
                {currentNote && <StaffRenderer clef={clef} note={currentNote} />}

                <div className="space-y-6">
                  {/* Accidental Toggle */}
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
                      >
                        {letter}{selectedAccidental === 'sharp' ? '♯' : ''}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="find" className="mt-0 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 text-center space-y-8">
               <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <Keyboard className="text-primary" /> Find this note on the piano!
                </h2>
                <div className="py-12 bg-primary/5 rounded-[2rem] border-4 border-dashed border-primary/20">
                    <span className="text-8xl font-black text-primary animate-pulse">
                      {currentNote?.letter}{currentNote?.accidental === 'sharp' ? '♯' : ''}
                      <span className="text-4xl text-primary/60 ml-2">{currentNote?.octave}</span>
                    </span>
                </div>
                <div className="flex justify-center gap-4">
                  <Button size="lg" onClick={() => currentNote && playNote(noteToTone(currentNote))} className="rounded-2xl gap-2 h-16 px-8 text-xl font-bold shadow-lg">
                    <Music /> Hear Tone
                  </Button>
                </div>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {/* Keyboard Always Visible */}
      <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-t-8 border-primary">
          <PianoKeyboard 
            activeNotes={status === 'correct' ? [noteToTone(currentNote!)] : []} 
            onNoteClick={handleNoteClick} 
          />
      </div>

      {/* Stats/Badges Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={cn("p-6 rounded-3xl bg-white border-2 flex flex-col items-center text-center gap-3 transition-all", score >= 100 ? "border-primary shadow-lg" : "border-muted opacity-40")}>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary"><Award /></div>
              <p className="font-bold">Rising Star</p>
          </div>
          <div className={cn("p-6 rounded-3xl bg-white border-2 flex flex-col items-center text-center gap-3 transition-all", accuracy === 100 && attempts >= 10 ? "border-green-400 shadow-lg" : "border-muted opacity-40")}>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Award /></div>
              <p className="font-bold">Perfect Pitch</p>
          </div>
          <div className={cn("p-6 rounded-3xl bg-white border-2 flex flex-col items-center text-center gap-3 transition-all", score >= 500 ? "border-purple-400 shadow-lg" : "border-muted opacity-40")}>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600"><Sparkles /></div>
              <p className="font-bold">Music Master</p>
          </div>
          <div className={cn("p-6 rounded-3xl bg-white border-2 flex flex-col items-center text-center gap-3 transition-all", attempts >= 50 ? "border-orange-400 shadow-lg" : "border-muted opacity-40")}>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600"><GraduationCap /></div>
              <p className="font-bold">Scholar</p>
          </div>
      </div>
    </div>
  );
}
