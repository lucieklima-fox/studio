"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

interface FeedbackOverlayProps {
  status: 'correct' | 'incorrect' | null;
  message?: string;
  onFinished: () => void;
}

export function FeedbackOverlay({ status, message, onFinished }: FeedbackOverlayProps) {
  useEffect(() => {
    if (status) {
      const timer = setTimeout(onFinished, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, onFinished]);

  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -20 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
        >
          <div className={`p-8 rounded-full shadow-2xl flex flex-col items-center gap-4 bg-white/95 border-4 ${
            status === 'correct' ? 'border-green-400 text-green-600' : 'border-destructive text-destructive'
          }`}>
            {status === 'correct' ? (
              <>
                <CheckCircle2 size={80} className="animate-bounce" />
                <span className="text-2xl font-bold">Awesome!</span>
              </>
            ) : (
              <>
                <XCircle size={80} className="animate-pulse" />
                <span className="text-2xl font-bold">Oops!</span>
                {message && <span className="text-lg font-medium text-muted-foreground">{message}</span>}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
