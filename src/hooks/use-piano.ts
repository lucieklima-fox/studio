"use client";

import { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

/**
 * Hook to manage piano audio playback using Tone.js.
 * Handles note strings (e.g., "C4", "F#4") or MIDI numbers.
 */
export function usePiano() {
  const synth = useRef<Tone.PolySynth | null>(null);

  useEffect(() => {
    synth.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'triangle', // Child-friendly soft sound
      },
      envelope: {
        attack: 0.005,
        decay: 0.2,
        sustain: 0.4,
        release: 1.2,
      },
    }).toDestination();

    return () => {
      synth.current?.dispose();
    };
  }, []);

  const playNote = useCallback((note: string | number, duration: string = '8n') => {
    if (!synth.current) return;
    
    // Resume audio context if it's suspended (required by browser policies)
    if (Tone.getContext().state !== 'running') {
      Tone.start();
    }
    
    // Tone.js triggerAttackRelease handles both MIDI numbers and note strings
    try {
      synth.current.triggerAttackRelease(note as any, duration);
    } catch (e) {
      console.warn('Failed to play note:', note, e);
    }
  }, []);

  return { playNote };
}
