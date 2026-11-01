'use client';

import React from 'react';
import { Activity, Bell, Search, ShieldCheck } from 'lucide-react';
import { sound } from '@/lib/sound';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAlerts: () => void;
  activeTicker: string;
}

export function Header({ onOpenSearch, onOpenAlerts, activeTicker }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-neutral-950/90 backdrop-blur-md border-b border-neutral-850 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Mandate */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono text-sm tracking-wider shadow-sm shadow-emerald-950">
            F
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-base tracking-tight">FINN</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60 font-medium">
                ENAM Agent
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              NSE Live Intelligence Layer
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Ticker Switcher Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSearch();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-mono transition-all hover:bg-neutral-850"
            title="Search any NSE stock (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline text-neutral-400">Search:</span>
            <span className="font-semibold text-emerald-400">{activeTicker.replace('.NS', '')}</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] text-neutral-400 bg-neutral-800 rounded border border-neutral-750 font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Triggered Alert Settings */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAlerts();
            }}
            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition-all hover:bg-neutral-850 relative"
            title="Configure Anomaly Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
