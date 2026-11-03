'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, ArrowRight } from 'lucide-react';
import { sound } from '@/lib/sound';

interface NotificationToastProps {
  onSelectTicker: (ticker: string) => void;
}

export function NotificationToast({ onSelectTicker }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Show toast after 2.5 seconds to demonstrate live push alert
    const timer = setTimeout(() => {
      if (!hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sound.playChime();
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [hasShown]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[92%] sm:w-full bg-neutral-900/95 backdrop-blur-xl border border-emerald-500/40 rounded-2xl shadow-2xl p-3.5 shadow-emerald-950/40"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Live Anomaly Alert
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">Just now</span>
              </div>

              <div className="text-xs font-bold text-white mt-0.5">
                KAYNES: 3.42x Volume Spike (+5.8%)
              </div>

              <p className="text-[11px] text-neutral-300 mt-0.5 leading-snug">
                OSAT semiconductor clearance triggered heavy institutional volume breakout above ₹4,800.
              </p>

              <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-neutral-800">
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsVisible(false);
                    onSelectTicker('KAYNES.NS');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-[11px] font-mono flex items-center gap-1 transition-colors"
                >
                  <span>Inspect Diligence</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="px-2 py-1 text-[11px] text-neutral-400 hover:text-white font-mono"
                >
                  Dismiss
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsVisible(false)}
              className="text-neutral-500 hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
