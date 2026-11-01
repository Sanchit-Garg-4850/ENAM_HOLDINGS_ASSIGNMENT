'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '@/lib/sound';
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Filter,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Announcement, AnnouncementCategory } from '@/lib/types';
import { AnnouncementCard } from './AnnouncementCard';

interface PushFeedProps {
  onSelectTicker: (ticker: string) => void;
  onOpenAlertSettings: () => void;
  onClearUrgent?: () => void;
}

export function PushFeed({ onSelectTicker, onOpenAlertSettings, onClearUrgent }: PushFeedProps) {
  const [windowHours, setWindowHours] = useState<number>(24);
  const [onlyMaterial, setOnlyMaterial] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<AnnouncementCategory | 'ALL'>('ALL');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [collapsedRoutineCount, setCollapsedRoutineCount] = useState<number>(0);
  const [showRoutineDrawer, setShowRoutineDrawer] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Time window options
  const windowOptions = [
    { label: '24 Hours', hours: 24 },
    { label: '3 Days', hours: 72 },
    { label: '7 Days', hours: 168 },
    { label: '30 Days', hours: 720 },
  ];

  // Category filter options
  const categoryFilters: Array<{ id: AnnouncementCategory | 'ALL'; label: string }> = [
    { id: 'ALL', label: 'All Feeds' },
    { id: 'results', label: 'Quarterly Results' },
    { id: 'management_change', label: 'Mgmt Changes' },
    { id: 'M&A', label: 'M&A & Restructuring' },
    { id: 'capex', label: 'Capex' },
    { id: 'pledging', label: 'Pledging' },
  ];

  useEffect(() => {
    async function fetchAnnouncements() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          windowHours: windowHours.toString(),
          onlyMaterial: onlyMaterial.toString(),
        });

        if (selectedCategory !== 'ALL') {
          params.append('category', selectedCategory);
        }

        const res = await fetch(`/api/announcements?${params.toString()}`);
        const json = await res.json();
        if (json.success) {
          setAnnouncements(json.data);
          setCollapsedRoutineCount(json.collapsedRoutineCount || 0);
        }
      } catch (err) {
        console.error('Failed to load push announcements:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnnouncements();
  }, [windowHours, onlyMaterial, selectedCategory]);

  return (
    <div className="space-y-4 pb-20">
      {/* Executive Briefing Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-950 border border-emerald-900/30">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-emerald-400" />
            Windowed Push Digest
          </span>
          <div className="flex items-center gap-2">
            {onClearUrgent && (
              <button
                onClick={() => {
                  sound.playSuccess();
                  onClearUrgent();
                }}
                className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 transition-colors"
                title="Mark all urgent alerts as reviewed"
              >
                <span>✓ Clear Badge</span>
              </button>
            )}
            <button
              onClick={onOpenAlertSettings}
              className="text-[11px] font-mono text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3 text-neutral-400" />
              <span>Triggers: &gt;2x Vol | ±3%</span>
            </button>
          </div>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          High-conviction filtration across your 18 portfolio companies. Routine secretarial filings are collapsed by default to preserve attention.
        </p>
      </div>

      {/* Control Strip 1: Time Window Pills & Materiality Toggle */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Time Window Tabs */}
        <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1 gap-1">
          {windowOptions.map((opt) => (
            <button
              key={opt.hours}
              onClick={() => {
                sound.playClick();
                setWindowHours(opt.hours);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                windowHours === opt.hours
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Materiality Toggle */}
        <button
          onClick={() => {
            sound.playClick();
            setOnlyMaterial(!onlyMaterial);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
            onlyMaterial
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium'
              : 'bg-neutral-900 border-neutral-850 text-neutral-400 hover:text-white'
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>{onlyMaterial ? 'Material Only' : 'Include Routine'}</span>
        </button>
      </div>

      {/* Control Strip 2: Horizontal Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {categoryFilters.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              sound.playClick();
              setSelectedCategory(cat.id);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
              selectedCategory === cat.id
                ? 'bg-neutral-800 border-neutral-700 text-white font-semibold'
                : 'bg-neutral-900/60 border-neutral-850 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Announcements List with Staggered Entrance Animations */}
      {isLoading ? (
        <div className="space-y-3 py-8 text-center text-neutral-500 text-xs font-mono">
          <div className="inline-block w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-2"></div>
          <p>Processing exchange filings and price movements...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-neutral-900/40 border border-neutral-850">
          <Layers className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
          <h4 className="text-white text-sm font-semibold mb-1">No announcements in this window</h4>
          <p className="text-neutral-400 text-xs max-w-xs mx-auto">
            Try expanding your window to 7 Days or 30 Days, or switch off the Material Only filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: Math.min(idx * 0.04, 0.4) }}
            >
              <AnnouncementCard
                announcement={item}
                onSelectTicker={onSelectTicker}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Collapsed Routine Filings Counter Tray */}
      <AnimatePresence>
        {onlyMaterial && collapsedRoutineCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-neutral-850 bg-neutral-900/50 p-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
                <strong>{collapsedRoutineCount}</strong> routine filings collapsed (ESOPs, Reg 74(5), duplicate certificates)
              </span>
              <button
                onClick={() => {
                  sound.playClick();
                  setOnlyMaterial(false);
                }}
                className="text-emerald-400 hover:text-emerald-300 font-mono font-medium flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
