
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PianoKeyboard } from '@/components/piano/PianoKeyboard';
import { StaffRenderer } from '@/components/staff/StaffRenderer';
import { FeedbackOverlay } from './FeedbackOverlay';
import { usePiano } from '@/hooks/use-piano';
import { ALL_NOTES, MELODIES, NoteName, FullNote } from '@/lib/music-constants';
import { generatePersonalizedPracticeSession } from '@/ai/flows/generate-personalized-practice-session';
import { Sparkles, Music, Keyboard, GraduationCap, RotateCcw, Award, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type GameMode = 'identify' | 'find' | 'sequence' | 'melody';

export default function GameContainer() {
  const { playNote } = usePiano();
  const [mode, setMode] = useState<GameMode>('identify');
  const [clef, setClef] = useState<'treble' | 'bass'>('treble');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [currentNote, setCurrentNote] = useState<FullNote | null>(null);
  const [status, setStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  
  // Sequence Mode State
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);

  // Initialize first game
  useEffect(() => {
    generateNextRound();
  }, [mode, clef]);

  const generateNextRound = useCallback(() => {
    if (mode === 'identify' || mode === 'find') {
      const filtered = ALL_NOTES.filter(n => 
        clef === 'treble' ? (n.octave >= 4 && n.octave <= 5) : (n.octave >= 2 && n.octave <= 3)
      );
      const randomNote = filtered[Math.floor(Math.random() * filtered.length)];
      setCurrentNote(randomNote);
    } else if (mode === 'sequence') {
      const filtered = ALL_NOTES.filter(n => n.octave === 4);
      const newSeq = Array.from({ length: 3 }, () => filtered[Math.floor(Math.random() * filtered.length)].id);
      setSequence(newSeq);
      setUserSequence([]);
    } else if (mode === 'melody') {
      const melody = MELODIES[Math.floor(Math.random() * MELODIES.length)];
      setSequence(melody.sequence);
      setUserSequence([]);
    }
  }, [mode, clef]);

  const handleNoteClick = useCallback((noteId: string) => {
    playNote(noteId);
    
    if (status) return; // Prevent double clicks during feedback

    if (mode === 'identify' || mode === 'find') {
      const isCorrect = noteId === currentNote?.id;
      setAttempts(a => a + 1);
      if (isCorrect) {
        setScore(s => s + 10);
        setStatus('correct');
      } else {
        setMistakes(m => [...new Set([...m, currentNote?.id || ''])]);
        setStatus('incorrect');
      }
    } else if (mode === 'sequence' || mode === 'melody') {
      const nextIndex = userSequence.length;
      if (noteId === sequence[nextIndex]) {
        const newSeq = [...userSequence, noteId];
        setUserSequence(newSeq);
        if (newSeq.length === sequence.length) {
          setScore(s => s + 50);
          setStatus('correct');
        }
      } else {
        setStatus('incorrect');
        setUserSequence([]);
      }
    }
  }, [currentNote, status, mode, sequence, userSequence, playNote]);

  const handleNameClick = (name: string) => {
    if (!currentNote || status) return;
    const isCorrect = currentNote.name === name;
    setAttempts(a => a + 1);
    if (isCorrect) {
        setScore(s => s + 10);
        setStatus('correct');
        playNote(currentNote.id);
    } else {
        setMistakes(m => [...new Set([...m, currentNote.id])]);
        setStatus('incorrect');
    }
  };

  const handleAIPractice = async () => {
    setLoadingAI(true);
    try {
      const result = await generatePersonalizedPracticeSession({
        challengingNotes: mistakes,
        challengingClefs: [clef],
        recentPerformanceSummary: `Child got ${score} points and made ${mistakes.length} errors.`
      });
      
      // Update game based on AI focus
      if (result.exerciseType === 'identify_note_on_staff') setMode('identify');
      else if (result.exerciseType === 'find_note_on_keyboard') setMode('find');
      else setMode('sequence');
      
      // Dynamic focus notes from AI
      if (result.focusNotes.length > 0) {
        const found = ALL_NOTES.find(n => n.id === result.focusNotes[0]);
        if (found) setCurrentNote(found);
      }
    } finally {
      setLoadingAI(false);
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
            <p className="text-muted-foreground font-medium">Your musical journey starts here!</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
            <div className="text-center px-6 py-3 bg-primary/10 rounded-2xl">
                <p className="text-xs font-bold text-primary uppercase tracking-wider">Score</p>
                <p className="text-3xl font-black text-primary">{score}</p>
            </div>
            <div className="text-center px-6 py-3 bg-accent/10 rounded-2xl">
                <p className="text-xs font-bold text-accent uppercase tracking-wider">Accuracy</p>
                <p className="text-3xl font-black text-accent">{accuracy}%</p>
            </div>
            <Button 
                variant="outline" 
                size="icon" 
                className="h-14 w-14 rounded-2xl"
                onClick={() => {setScore(0); setAttempts(0); generateNextRound();}}
            >
                <RotateCcw className="h-6 w-6" />
            </Button>
        </div>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as GameMode)} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto p-2 bg-white rounded-3xl border-2 border-primary/10 gap-2 mb-8">
          <TabsTrigger value="identify" className="py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white gap-2">
            <GraduationCap size={18} /> Identify
          </TabsTrigger>
          <TabsTrigger value="find" className="py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white gap-2">
            <Keyboard size={18} /> Find Key
          </TabsTrigger>
          <TabsTrigger value="sequence" className="py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white gap-2">
            <Music size={18} /> Sequences
          </TabsTrigger>
          <TabsTrigger value="melody" className="py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white gap-2">
            <Award size={18} /> Melodies
          </TabsTrigger>
        </TabsList>

        <div className="relative overflow-hidden min-h-[400px]">
          <FeedbackOverlay 
            status={status} 
            message={status === 'incorrect' ? `That was ${currentNote?.name || 'different'}` : undefined} 
            onFinished={() => {setStatus(null); generateNextRound();}} 
          />

          <TabsContent value="identify" className="mt-0 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
              <CardContent className="p-8 space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <GraduationCap className="text-primary" /> What's this note?
                    </h2>
                    <div className="flex bg-muted p-1 rounded-xl">
                        <Button variant={clef === 'treble' ? 'default' : 'ghost'} onClick={() => setClef('treble')} className="rounded-lg">Treble</Button>
                        <Button variant={clef === 'bass' ? 'default' : 'ghost'} onClick={() => setClef('bass')} className="rounded-lg">Bass</Button>
                    </div>
                </div>
                
                <StaffRenderer clef={clef} note={currentNote?.id} />

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                  {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((name) => (
                    <Button 
                      key={name} 
                      onClick={() => handleNameClick(name)}
                      className="h-16 text-xl font-bold rounded-2xl transition-transform active:scale-95"
                      variant="secondary"
                    >
                      {name}
                    </Button>
                  ))}
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
                    <span className="text-8xl font-black text-primary animate-pulse">{currentNote?.name}</span>
                </div>
                <div className="flex justify-center gap-4">
                  <Button size="lg" onClick={() => currentNote && playNote(currentNote.id)} className="rounded-2xl gap-2 h-14">
                    <Music /> Play Tone
                  </Button>
                </div>
            </Card>
          </TabsContent>

          <TabsContent value="sequence" className="mt-0 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 text-center space-y-6">
               <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <Music className="text-primary" /> Play the sequence!
                </h2>
                <div className="flex justify-center gap-4 flex-wrap">
                  {sequence.map((noteId, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "w-20 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold transition-all border-4 shadow-sm",
                        idx < userSequence.length ? "bg-green-100 border-green-500 text-green-700" : "bg-muted border-muted-foreground/20 text-muted-foreground"
                      )}
                    >
                      {idx < userSequence.length ? noteId.replace(/\d/, '') : '?'}
                    </div>
                  ))}
                </div>
                <Button size="lg" onClick={() => {
                   sequence.forEach((n, i) => setTimeout(() => playNote(n), i * 600));
                }} variant="outline" className="rounded-2xl gap-2">
                  Play Example
                </Button>
            </Card>
          </TabsContent>

          <TabsContent value="melody" className="mt-0 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 text-center space-y-6">
                <h2 className="text-2xl font-bold">Play: {MELODIES.find(m => m.sequence === sequence)?.name || 'Simple Song'}</h2>
                <div className="p-6 bg-muted rounded-2xl font-mono text-2xl tracking-widest text-primary font-bold">
                    {MELODIES.find(m => m.sequence === sequence)?.display}
                </div>
                <Progress value={(userSequence.length / sequence.length) * 100} className="h-4 rounded-full" />
                <p className="text-muted-foreground">Tap the keys in order!</p>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {/* Keyboard Always Visible */}
      <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-t-8 border-primary">
          <PianoKeyboard 
            activeNotes={userSequence.length > 0 ? userSequence : [status === 'correct' ? currentNote?.id || '' : '']} 
            onNoteClick={handleNoteClick} 
          />
      </div>

      {/* AI Practice Section */}
      {mistakes.length > 0 && (
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-accent text-white p-8 overflow-hidden relative">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="bg-white/20 p-6 rounded-3xl">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-3xl font-black">Magical AI Practice</h3>
              <p className="text-white/80 text-lg font-medium">You've missed some notes! Let's generate a special lesson just for you to master them.</p>
              <div className="flex gap-2 flex-wrap">
                  {mistakes.map(m => (
                      <span key={m} className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">{m}</span>
                  ))}
              </div>
            </div>
            <Button 
                size="lg" 
                onClick={handleAIPractice} 
                disabled={loadingAI}
                className="bg-white text-accent hover:bg-white/90 rounded-[2rem] px-10 h-16 text-xl font-bold shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loadingAI ? 'Creating Magic...' : 'Start Special Practice'}
            </Button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-2xl" />
        </Card>
      )}

      {/* Badges/Gamification */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={cn("p-6 rounded-3xl bg-white border-2 flex flex-col items-center text-center gap-3 transition-all", score >= 100 ? "border-primary shadow-lg" : "border-muted opacity-40")}>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary"><Award /></div>
              <p className="font-bold">Music Starter</p>
          </div>
          <div className={cn("p-6 rounded-3xl bg-white border-2 flex flex-col items-center text-center gap-3 transition-all", mistakes.length === 0 && score > 0 ? "border-green-400 shadow-lg" : "border-muted opacity-40")}>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600"><CheckCircle2 /></div>
              <p className="font-bold">Accuracy King</p>
          </div>
          <div className={cn("p-6 rounded-3xl bg-white border-2 flex flex-col items-center text-center gap-3 transition-all", mode === 'melody' && status === 'correct' ? "border-purple-400 shadow-lg" : "border-muted opacity-40")}>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600"><Music /></div>
              <p className="font-bold">Song Master</p>
          </div>
          <div className={cn("p-6 rounded-3xl bg-white border-2 flex flex-col items-center text-center gap-3 transition-all", score >= 500 ? "border-orange-400 shadow-lg" : "border-muted opacity-40")}>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600"><Sparkles /></div>
              <p className="font-bold">Maestro</p>
          </div>
      </div>
    </div>
  );
}
