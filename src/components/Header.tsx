'use client';

import React from 'react';
import { Search, Sun, Moon, HelpCircle, Palette, Star } from 'lucide-react';
import { sound } from '@/lib/sound';
import { useTheme } from '@/lib/themeContext';
import { useWatchlist } from '@/lib/useWatchlist';
import { NotificationCenter } from './NotificationCenter';



interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAlerts: () => void;
  onOpenTutorial: () => void;
  onOpenAppearance: () => void;
  onSelectTicker: (ticker: string) => void;
  activeTicker: string;
}

export function Header({
  onOpenSearch,
  onOpenAlerts,
  onOpenTutorial,
  onOpenAppearance,
  onSelectTicker,
  activeTicker,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { isWatchlisted, toggleWatchlist } = useWatchlist();
  const isPinned = isWatchlisted(activeTicker);

  return (
    <header className="sticky top-0 z-30 w-full bg-neutral-950/90 backdrop-blur-md border-b border-neutral-850 px-3 sm:px-4 py-2 sm:py-2.5 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Mandate */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono text-xs sm:text-sm tracking-wider shadow-sm shadow-emerald-950 shrink-0">
            F
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white text-sm sm:text-base tracking-tight">FINN</span>
            <span className="text-[9px] sm:text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60 font-medium">
              ENAM
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" title="NSE Live Data Active" />
          </div>
        </div>

        {/* Action Controls - Clean, Uncongested Layout */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Ticker Switcher Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSearch();
            }}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-mono transition-all hover:bg-neutral-850"
            title="Search any NSE stock (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-semibold text-emerald-400">{activeTicker.replace('.NS', '')}</span>
            <kbd className="hidden md:inline-block px-1 py-0.2 text-[9px] text-neutral-500 bg-neutral-800/80 rounded border border-neutral-750 font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Quick Active Ticker Watchlist Pin Toggle */}
          <button
            onClick={() => toggleWatchlist(activeTicker)}
            className={`p-1.5 rounded-lg border transition-all ${
              isPinned
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:text-amber-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title={isPinned ? `Remove ${activeTicker.replace('.NS', '')} from Watchlist` : `Pin ${activeTicker.replace('.NS', '')} to Watchlist`}
          >
            <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400' : ''}`} />
          </button>


          {/* Direct Sun / Moon Toggle (Desktop) */}
          <button
            onClick={toggleTheme}
            className="hidden sm:flex p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition-all hover:bg-neutral-850"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-blue-500 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {/* Appearance & Color Schemes Button (Opens Appearance modal) */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAppearance();
            }}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-emerald-400 transition-all hover:bg-neutral-850 flex items-center gap-1"
            title="Appearance, Colors & Themes"
            aria-label="Appearance & Themes"
          >
            <Palette className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          {/* Platform Tour Button (Desktop) */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenTutorial();
            }}
            className="hidden sm:flex p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-emerald-400 transition-all hover:bg-neutral-850"
            title="Platform Walkthrough Tour"
            aria-label="Platform Tutorial"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {/* Interactive Live Alert Radar Notification Center */}
          <NotificationCenter
            onSelectTicker={onSelectTicker}
            onOpenAlertSettings={onOpenAlerts}
          />
        </div>
      </div>
    </header>
  );
}
