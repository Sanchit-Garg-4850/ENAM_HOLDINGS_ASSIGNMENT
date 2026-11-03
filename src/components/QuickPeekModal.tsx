'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  ExternalLink,
  Sparkles,
  TrendingUp,
  TrendingDown,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  Clock,
  Building2,
} from 'lucide-react';
import { Announcement } from '@/lib/types';
import { CATEGORY_REGISTRY } from '@/lib/classification';
import { AnimatedCounter } from './AnimatedCounter';
import { sound } from '@/lib/sound';

interface QuickPeekModalProps {
  announcement: Announcement | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectTicker: (ticker: string) => void;
}

export function QuickPeekModal({
  announcement,
  isOpen,
  onClose,
  onSelectTicker,
}: QuickPeekModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !announcement) return null;

  const catInfo = CATEGORY_REGISTRY[announcement.category] || CATEGORY_REGISTRY.unclassified;
  const isUrgent = announcement.tier === 'tier1_urgent';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="w-full max-w-2xl rounded-2xl bg-neutral-925 border border-neutral-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-neutral-800 bg-neutral-900/80">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  sound.playClick();
                  onSelectTicker(announcement.ticker);
                  onClose();
                }}
                className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-mono font-bold text-xs tracking-wide transition-colors"
              >
                {announcement.ticker.replace('.NS', '')}
              </button>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-medium border ${catInfo.badgeBg} ${catInfo.badgeText}`}
              >
                {catInfo.label}
              </span>

              {isUrgent && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                  </span>
                  <span>High Impact</span>
                </span>
              )}

              <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-1 ml-1">
                <Clock className="w-3 h-3 text-neutral-500" />
                {announcement.publishedAt}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
            {/* Headline */}
            <h2 className="text-white text-base sm:text-lg font-bold leading-snug tracking-tight">
              {announcement.headline}
            </h2>

            {/* Why You Care / Strategic Takeaway */}
            <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-850 text-xs sm:text-sm text-neutral-300 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-medium">Strategic Signal: </strong>
                <span>{announcement.oneLineTakeaway}</span>
              </div>
            </div>

            {/* If Results: 4-Box Metric Grid */}
            {announcement.results && (
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                  <span>{announcement.results.quarter} Headline Financials</span>
                  <span className="text-neutral-500">Period: {announcement.results.periodEnded}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                  {/* Revenue */}
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                    <span className="text-[10px] text-neutral-400">Revenue</span>
                    <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                      ₹<AnimatedCounter value={announcement.results.revenue} decimals={1} /> Cr
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                      <span className={announcement.results.revenueYoY >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {announcement.results.revenueYoY >= 0 ? '+' : ''}{announcement.results.revenueYoY}% YoY
                      </span>
                    </div>
                  </div>

                  {/* EBITDA */}
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                    <span className="text-[10px] text-neutral-400">EBITDA</span>
                    <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                      ₹<AnimatedCounter value={announcement.results.ebitda} decimals={1} /> Cr
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                      <span className={announcement.results.ebitdaYoY >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {announcement.results.ebitdaYoY >= 0 ? '+' : ''}{announcement.results.ebitdaYoY}% YoY
                      </span>
                    </div>
                  </div>

                  {/* PAT */}
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                    <span className="text-[10px] text-neutral-400">Net Profit</span>
                    <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                      ₹<AnimatedCounter value={announcement.results.pat} decimals={1} /> Cr
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                      <span className={announcement.results.patYoY >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {announcement.results.patYoY >= 0 ? '+' : ''}{announcement.results.patYoY}% YoY
                      </span>
                    </div>
                  </div>

                  {/* Margin */}
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                    <span className="text-[10px] text-neutral-400">EBITDA Margin</span>
                    <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                      {announcement.results.ebitdaMargin}%
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                      <span className={announcement.results.ebitdaYoY >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {announcement.results.ebitdaYoY >= 0 ? '+' : ''}{announcement.results.ebitdaYoY}% YoY
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* If Management Change */}
            {announcement.managementChange && (
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-850 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-indigo-400 font-mono text-[11px] font-semibold">
                  <UserCheck className="w-4 h-4" />
                  <span>Executive Pedigree & Background</span>
                </div>
                <div className="space-y-1 text-neutral-300">
                  <p><strong className="text-white">Executive:</strong> {announcement.managementChange.personName} ({announcement.managementChange.role})</p>
                  <p><strong className="text-white">Action:</strong> {announcement.managementChange.changeType.toUpperCase()} (Effective: {announcement.managementChange.effectiveDate})</p>
                  <p><strong className="text-white">Background:</strong> {announcement.managementChange.bio}</p>
                  <p className="pt-1 text-amber-300/90"><strong className="text-amber-400">Significance:</strong> {announcement.managementChange.significance}</p>
                </div>
              </div>
            )}

            {/* Raw Disclosure Excerpt */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-850 space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-400 font-semibold block">
                Primary Exchange Filing Excerpt (BSE/NSE)
              </span>
              <p className="text-xs text-neutral-300 leading-relaxed font-mono whitespace-pre-wrap bg-neutral-900/60 p-3 rounded-lg border border-neutral-800/80">
                {announcement.oneLineTakeaway} — Full corporate disclosure authenticated under Regulation 30 of SEBI (LODR) Regulations, 2015.
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-neutral-800 bg-neutral-900/80">
            {announcement.sourceFilingUrl ? (
              <a
                href={announcement.sourceFilingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-neutral-500" />
                <span>Open Original PDF</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-xs font-mono text-neutral-500">Official BSE Regulatory Filing</span>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs font-mono text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                Esc to Close
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onSelectTicker(announcement.ticker);
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Deep Dive Diligence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
