'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Scale,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Mic,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Volume2,
  Square,
  Copy,
  Check,
} from 'lucide-react';
import { GuidanceAuditItem, DiligenceModule, StockQuote } from '@/lib/types';
import { AnimatedCounter } from './AnimatedCounter';
import { sound } from '@/lib/sound';

interface NarrativeVsNumbersProps {
  quote: StockQuote;
  diligence: DiligenceModule;
  onSelectTicker?: (ticker: string) => void;
}

export function NarrativeVsNumbers({ quote, diligence, onSelectTicker }: NarrativeVsNumbersProps) {
  const auditData = diligence.narrativeVsNumbers;
  const reliability = auditData.reliabilityScore;

  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const deliveredCount = auditData.audits.filter((a) => a.status === 'DELIVERED').length;
  const partialCount = auditData.audits.filter((a) => a.status === 'PARTIAL').length;
  const missedCount = auditData.audits.filter((a) => a.status === 'MISSED').length;

  function toggleAudioPlayback(idx: number, text: string) {
    sound.playClick();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (playingIdx === idx) {
      window.speechSynthesis.cancel();
      setPlayingIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setPlayingIdx(null);
    utterance.onerror = () => setPlayingIdx(null);

    setPlayingIdx(idx);
    window.speechSynthesis.speak(utterance);
  }

  function handleCopyCitation(idx: number, audit: GuidanceAuditItem) {
    sound.playSuccess();
    const text = `> "${audit.promisedGuidance}"\n> — Concall ${audit.concallDate} (${audit.concallCitation})\n\nDelivered: ${audit.deliveredResult} (Audited Filing ${audit.filingDate}, ${audit.filingCitation})`;
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  const demoPresets = ['TRENT.NS', 'DIXON.NS', 'ZOMATO.NS', 'RELIANCE.NS', 'HDFCBANK.NS', 'TCS.NS', 'KAYNES.NS'];

  return (
    <div className="space-y-4 pb-20">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-neutral-900 to-neutral-950 border border-indigo-900/30">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" />
            Primary Source Audit Core
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            4-Quarter Promise vs. Delivery
          </span>
        </div>
        <h2 className="text-white text-base sm:text-lg font-bold tracking-tight mb-1">
          Narrative vs. Numbers: {quote.name} ({quote.symbol})
        </h2>
        <p className="text-xs text-neutral-300 leading-relaxed">
          The difference between summarizing management and analyzing them. Audits what management promised in concall transcripts against what was actually delivered in audited exchange filings.
        </p>

        {/* Demo Ticker Pills */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-neutral-800/60 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-neutral-400 font-mono shrink-0">Switch Case:</span>
          {demoPresets.map((t) => (
            <button
              key={t}
              onClick={() => {
                sound.playClick();
                onSelectTicker?.(t);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                quote.ticker === t
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 font-bold'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {t.replace('.NS', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Reliability Scoreboard Card */}
      <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        {/* Score Ring */}
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-full bg-neutral-950 border-2 border-indigo-500/40 flex items-center justify-center font-mono font-bold text-white text-lg shadow-inner">
            <AnimatedCounter value={reliability} suffix="%" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Management Reliability</div>
            <div className="text-[11px] text-neutral-400 font-mono">
              {reliability >= 85 ? 'High Credibility' : reliability >= 70 ? 'Moderate Tracking' : 'High Guidance Risk'}
            </div>
          </div>
        </div>

        {/* Status Count Tally */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{deliveredCount} Met</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{partialCount} Partial</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <XCircle className="w-3.5 h-3.5" />
            <span>{missedCount} Missed</span>
          </div>
        </div>

        {/* Executive Verdict */}
        <div className="text-[11px] text-neutral-300 border-l border-neutral-800 sm:pl-3">
          <span className="text-neutral-400 font-mono block text-[10px] uppercase">Audit Synthesis</span>
          <p className="line-clamp-2">{auditData.executiveSummary}</p>
        </div>
      </div>

      {/* 4-Quarter Detailed Audit Trail */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 px-1">
          Quarterly Promise vs. Delivery Matrix
        </div>

        {auditData.audits.map((audit, idx) => {
          const isDelivered = audit.status === 'DELIVERED';
          const isPartial = audit.status === 'PARTIAL';
          const isMissed = audit.status === 'MISSED';

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2, scale: 1.004 }}
              transition={{ duration: 0.22, delay: idx * 0.05 }}
              className="rounded-xl border border-neutral-800 bg-neutral-925/80 p-4 space-y-3 hover:border-neutral-750 transition-all"
            >
              {/* Quarter & Metric Header */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-neutral-800 text-white font-mono font-bold text-xs">
                    {audit.quarter}
                  </span>
                  <span className="text-white text-xs sm:text-sm font-semibold">
                    {audit.metric}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
                  {isDelivered && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      DELIVERED
                    </span>
                  )}
                  {isPartial && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      PARTIAL / DELAYED
                    </span>
                  )}
                  {isMissed && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      GUIDANCE MISSED
                    </span>
                  )}
                </div>
              </div>

              {/* Side-by-Side Comparison Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                {/* What Management Promised with Quartr-grade Audio Sync */}
                <div
                  className={`p-3 rounded-lg bg-neutral-950 border transition-all space-y-1.5 ${
                    playingIdx === idx
                      ? 'border-indigo-500/60 shadow-md shadow-indigo-950/40 ring-1 ring-indigo-500/30'
                      : 'border-neutral-850'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-indigo-400 font-mono text-[10px] uppercase font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Mic className="w-3 h-3" />
                      <span>Concall Promise ({audit.concallDate})</span>
                    </div>

                    <button
                      onClick={() => toggleAudioPlayback(idx, audit.promisedGuidance)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                        playingIdx === idx
                          ? 'bg-indigo-500 text-white font-bold'
                          : 'bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20'
                      }`}
                      title={playingIdx === idx ? 'Stop audio readout' : 'Play synchronized concall audio readout'}
                    >
                      {playingIdx === idx ? (
                        <>
                          <Square className="w-2.5 h-2.5 fill-current text-white" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-2.5 h-2.5" />
                          <span>Play</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p
                    className={`text-xs leading-relaxed italic transition-colors ${
                      playingIdx === idx ? 'text-indigo-200 font-medium' : 'text-neutral-200'
                    }`}
                  >
                    &ldquo;{audit.promisedGuidance}&rdquo;
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono pt-1.5 border-t border-neutral-900">
                    <span>Citation: {audit.concallCitation}</span>
                    <button
                      onClick={() => handleCopyCitation(idx, audit)}
                      className="text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                      title="Copy quote with verified citation"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" />
                          <span>Cite</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* What Was Actually Delivered */}
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] uppercase font-semibold">
                    <FileText className="w-3 h-3" />
                    <span>Audited Delivery ({audit.filingDate})</span>
                  </div>
                  <p className="text-neutral-200 text-xs leading-relaxed font-medium">
                    {audit.deliveredResult}
                  </p>
                  <div className="text-[10px] text-neutral-400 font-mono pt-1.5 border-t border-neutral-900">
                    Citation: {audit.filingCitation}
                  </div>
                </div>
              </div>

              {/* Divergence Analysis & Management Excuse */}
              <div className="p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-[11px] text-neutral-300 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-200 font-medium">Divergence & Attribution: </strong>
                  <span>{audit.divergenceAnalysis}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
