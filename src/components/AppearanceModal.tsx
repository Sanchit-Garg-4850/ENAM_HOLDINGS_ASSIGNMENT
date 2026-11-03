'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Sun,
  Moon,
  Check,
  X,
  HelpCircle,
  Sparkles,
  Command,
  Volume2,
} from 'lucide-react';
import { useTheme, ACCENT_OPTIONS, AccentColor } from '@/lib/themeContext';
import { sound } from '@/lib/sound';

interface AppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTutorial: () => void;
}

export function AppearanceModal({
  isOpen,
  onClose,
  onOpenTutorial,
}: AppearanceModalProps) {
  const { theme, setTheme, accent, setAccent } = useTheme();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop click dismiss */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-5 space-y-4 z-10 font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-white text-sm font-bold tracking-tight">Appearance & Themes</h3>
                <p className="text-[11px] text-neutral-400">Personalize display mode and accent palette</p>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Display Mode (Light / Dark) */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase text-neutral-400 font-semibold block">
              Display Mode
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Dark Option */}
              <button
                onClick={() => {
                  sound.playClick();
                  setTheme('dark');
                }}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  theme === 'dark'
                    ? 'bg-neutral-800/90 border-emerald-500/50 shadow-sm'
                    : 'bg-neutral-950/60 border-neutral-850 hover:border-neutral-750'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Dark Mode</div>
                    <div className="text-[10px] text-neutral-400">Terminal Focus</div>
                  </div>
                </div>
                {theme === 'dark' && <Check className="w-4 h-4 text-emerald-400" />}
              </button>

              {/* Light Option */}
              <button
                onClick={() => {
                  sound.playClick();
                  setTheme('light');
                }}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  theme === 'light'
                    ? 'bg-neutral-800/90 border-emerald-500/50 shadow-sm'
                    : 'bg-neutral-950/60 border-neutral-850 hover:border-neutral-750'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-blue-500">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Light Mode</div>
                    <div className="text-[10px] text-neutral-400">Natural Executive</div>
                  </div>
                </div>
                {theme === 'light' && <Check className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* Accent Color Palettes */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase text-neutral-400 font-semibold block">
                Accent Palette
              </label>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                {ACCENT_OPTIONS.find((a) => a.id === accent)?.badgeLabel}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {ACCENT_OPTIONS.map((opt) => {
                const isSelected = accent === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setAccent(opt.id)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-neutral-800 border-emerald-500/60 shadow-sm scale-105'
                        : 'bg-neutral-950/40 border-neutral-850 hover:border-neutral-750'
                    }`}
                    title={opt.name}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shadow-inner relative"
                      style={{ backgroundColor: opt.colorHex }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-neutral-950 font-bold" />}
                    </div>
                    <span className="text-[9px] font-mono text-neutral-300 truncate max-w-full">
                      {opt.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Help & Platform Tour */}
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenTutorial();
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 hover:text-white transition-all font-mono"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Platform Tour</span>
            </button>

            <span className="text-[10px] text-neutral-500 font-mono flex items-center gap-1">
              <Command className="w-3 h-3" />
              <span>⌘K for Quick Search</span>
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
