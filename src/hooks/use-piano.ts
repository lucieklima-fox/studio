
"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import * as Tone from 'tone';

/**
 * Hook to manage piano audio playback using Tone.js Sampler.
 * Uses high-quality Salamander Grand Piano samples for a realistic "Classical" sound.
 */
export function usePiano() {
  const sampler = useRef<Tone.Sampler | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Initialize Sampler with Salamander Piano samples
    // Mapping keys to sample files for realistic pitch shifting
    sampler.current = new Tone.Sampler({
      urls: {
        "A1": "A1.mp3",
        "A2": "A2.mp3",
        "A3": "A3.mp3",
        "A4": "A4.mp3",
        "A5": "A5.mp3",
        "A6": "A6.mp3",
        "A7": "A7.mp3",
        "C1": "C1.mp3",
        "C2": "C2.mp3",
        "C3": "C3.mp3",
        "C4": "C4.mp3",
        "C5": "C5.mp3",
        "C6": "C6.mp3",
        "C7": "C7.mp3",
        "D#1": "Ds1.mp3",
        "D#2": "Ds2.mp3",
        "D#3": "Ds3.mp3",
        "D#4": "Ds4.mp3",
        "D#5": "Ds5.mp3",
        "D#6": "Ds6.mp3",
        "D#7": "Ds7.mp3",
        "F#1": "Fs1.mp3",
        "F#2": "Fs2.mp3",
        "F#3": "Fs3.mp3",
        "F#4": "Fs4.mp3",
        "F#5": "Fs5.mp3",
        "F#6": "Fs6.mp3",
        "F#7": "Fs7.mp3",
      },
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      onload: () => {
        setIsLoaded(true);
      },
    }).toDestination();

    return () => {
      sampler.current?.dispose();
    };
  }, []);

  const playNote = useCallback((note: string | number, duration: string = '2n') => {
    if (!sampler.current || !isLoaded) return;
    
    // Resume audio context if it's suspended (required by browser policies)
    if (Tone.getContext().state !== 'running') {
      Tone.start();
    }
    
    try {
      // Use sampler for more realistic sound than a simple synth
      sampler.current.triggerAttackRelease(note as any, duration);
    } catch (e) {
      console.warn('Failed to play note:', note, e);
    }
  }, [isLoaded]);

  return { playNote, isLoaded };
}
