'use client';

import React from 'react';
import { Search, Sun, Moon, HelpCircle } from 'lucide-react';
import { sound } from '@/lib/sound';
import { useTheme } from '@/lib/themeContext';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAlerts: () => void;
  onOpenTutorial: () => void;
  onSelectTicker: (ticker: string) => void;
  activeTicker: string;
}

export function Header({
  onOpenSearch,
  onOpenAlerts,
  onOpenTutorial,
  onSelectTicker,
  activeTicker,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 w-full bg-neutral-950/90 backdrop-blur-md border-b border-neutral-850 px-3 sm:px-4 py-2.5 sm:py-3 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand & Mandate */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono text-sm tracking-wider shadow-sm shadow-emerald-950 shrink-0">
            F
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-base tracking-tight">FINN</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60 font-medium">
                ENAM Agent
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 flex items-center gap-1 font-mono">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              NSE Live Data Feed
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Ticker Switcher Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSearch();
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-mono transition-all hover:bg-neutral-850"
            title="Search any NSE stock (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline text-neutral-400">Search:</span>
            <span className="font-semibold text-emerald-400">{activeTicker.replace('.NS', '')}</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] text-neutral-400 bg-neutral-800 rounded border border-neutral-750 font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle (Light / Dark Mode) */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition-all hover:bg-neutral-850"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-blue-500 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {/* Platform Tour / Tutorial Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenTutorial();
            }}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-emerald-400 transition-all hover:bg-neutral-850"
            title="Take Platform Tour / User Guide"
            aria-label="Platform Tutorial"
          >
            <HelpCircle className="w-4 h-4" />
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
