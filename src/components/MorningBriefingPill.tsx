'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Sparkles, ChevronRight, Check, X, ShieldAlert, ArrowUpRight, Clock } from 'lucide-react';
import { sound } from '@/lib/sound';

interface MorningBriefingPillProps {
  onSelectTicker: (ticker: string) => void;
  onOpenPushFeed?: () => void;
}

interface BriefingItem {
  ticker: string;
  badge: string;
  summary: string;
  impact: 'positive' | 'negative' | 'neutral';
  timeAgo: string;
}

export function MorningBriefingPill({ onSelectTicker, onOpenPushFeed }: MorningBriefingPillProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [lastReviewDate, setLastReviewDate] = useState<string>('Yesterday 18:30');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('finn_last_morning_review');
      if (stored) {
        const date = new Date(parseInt(stored, 10));
        setLastReviewDate(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch {
      // Ignore localStorage restrictions
    }
  }, []);

  const briefingItems: BriefingItem[] = [
    {
      ticker: 'TRENT.NS',
      badge: 'Margin Divergence',
      summary: 'Q2 EBITDA Margin contracted 120bps to 13.8% due to raw material and freight inflation despite +39% YoY revenue.',
      impact: 'negative',
      timeAgo: '4h ago',
    },
    {
      ticker: 'TITAN.NS',
      badge: 'Gold Procurement Alert',
      summary: 'Custom duty reduction impact: Short-term inventory loss of ₹290 Cr absorbed; jewelry LTL volumes up +25%.',
      impact: 'neutral',
      timeAgo: '7h ago',
    },
    {
      ticker: 'DIXON.NS',
      badge: 'Volume Multiplier 3.4x',
      summary: 'Institutional accumulation surge following mobile PLI component localization announcement with global ODM.',
      impact: 'positive',
      timeAgo: '11h ago',
    },
  ];

  function handleMarkAsRead() {
    sound.playSuccess();
    try {
      localStorage.setItem('finn_last_morning_review', Date.now().toString());
    } catch {}
    setIsDismissed(true);
    setIsOpen(false);
  }

  if (isDismissed) {
    return (
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-neutral-900/40 border border-neutral-850/60 text-[11px] font-mono text-neutral-400">
        <span className="flex items-center gap-1.5 text-neutral-400">
          <Check className="w-3 h-3 text-emerald-400" />
          Morning briefing reviewed • All 3 overnight disclosures triaged
        </span>
        <button
          onClick={() => {
            sound.playClick();
            setIsDismissed(false);
            setIsOpen(true);
          }}
          className="text-neutral-400 hover:text-emerald-400 text-[10px] underline"
        >
          Re-open
        </button>
      </div>
    );
  }

  return (
    <>
      {/* The 1-Second Glanceable Banner Pill */}
      <div className="relative group">
        <div
          onClick={() => {
            sound.playClick();
            setIsOpen(true);
          }}
          className="cursor-pointer flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-neutral-900/90 via-neutral-925/80 to-neutral-900/90 border border-neutral-800 hover:border-neutral-700/80 shadow-sm transition-all"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>

            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/90 font-bold shrink-0 flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-400" />
              Morning Briefing
            </span>

            <span className="text-neutral-500 text-xs hidden sm:inline">•</span>

            <span className="text-xs text-neutral-200 font-medium truncate">
              <strong className="text-white">3 New Filings</strong>
              <span className="text-neutral-400 mx-1.5">|</span>
              <span className="text-rose-400">1 Margin Alert (TRENT)</span>
              <span className="text-neutral-400 mx-1.5">|</span>
              <span className="text-emerald-400">0 Forensic Flags</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-mono text-neutral-400 group-hover:text-white transition-colors">
            <span className="hidden sm:inline text-[10px]">Open Synthesis</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Slide-Down / Modal Morning Synthesis Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-full max-w-lg rounded-2xl bg-neutral-925 border border-neutral-800 shadow-2xl p-4 sm:p-5 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 border-b border-neutral-850 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-white text-base font-bold tracking-tight flex items-center gap-2">
                      Overnight Synthesis Briefing
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                        Primary Filings
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      What changed since your last session ({lastReviewDate})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Glanceable Anomaly Cards */}
              <div className="space-y-2.5">
                {briefingItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-850 hover:border-neutral-750 transition-all flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            sound.playClick();
                            onSelectTicker(item.ticker);
                            setIsOpen(false);
                          }}
                          className="font-mono text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1"
                        >
                          {item.ticker.replace('.NS', '')}
                          <ArrowUpRight className="w-3 h-3 text-neutral-500" />
                        </button>
                        <span
                          className={`text-[10px] font-medium font-mono px-2 py-0.5 rounded border ${
                            item.impact === 'negative'
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                              : item.impact === 'positive'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">{item.timeAgo}</span>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed">{item.summary}</p>
                  </div>
                ))}
              </div>

              {/* Forensic Clean Bill of Health */}
              <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Forensic Sentinel:</strong> Zero auditor resignations, zero promoter pledging spikes, and zero Beneish M-Score red flags detected across your 18 tracked portfolio holdings.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-850">
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsOpen(false);
                    onOpenPushFeed?.();
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 transition-colors"
                >
                  View All Raw Disclosures →
                </button>

                <button
                  onClick={handleMarkAsRead}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark as Reviewed</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
