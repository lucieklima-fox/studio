"use client";

import { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

export function usePiano() {
  const synth = useRef<Tone.PolySynth | null>(null);

  useEffect(() => {
    synth.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'triangle',
      },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 1,
      },
    }).toDestination();

    return () => {
      synth.current?.dispose();
    };
  }, []);

  const playNote = useCallback((note: string, duration: string = '8n') => {
    if (!synth.current) return;
    
    // Resume audio context if it's suspended (browser policy)
    if (Tone.getContext().state !== 'running') {
      Tone.start();
    }
    
    synth.current.triggerAttackRelease(note, duration);
  }, []);

  return { playNote };
}
