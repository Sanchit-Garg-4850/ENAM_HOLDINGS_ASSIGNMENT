'use client';

import React from 'react';
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
} from 'lucide-react';
import { GuidanceAuditItem, DiligenceModule, StockQuote } from '@/lib/types';

interface NarrativeVsNumbersProps {
  quote: StockQuote;
  diligence: DiligenceModule;
  onSelectTicker?: (ticker: string) => void;
}

export function NarrativeVsNumbers({ quote, diligence, onSelectTicker }: NarrativeVsNumbersProps) {
  const auditData = diligence.narrativeVsNumbers;
  const reliability = auditData.reliabilityScore;

  const deliveredCount = auditData.audits.filter((a) => a.status === 'DELIVERED').length;
  const partialCount = auditData.audits.filter((a) => a.status === 'PARTIAL').length;
  const missedCount = auditData.audits.filter((a) => a.status === 'MISSED').length;

  const demoPresets = ['TRENT.NS', 'DIXON.NS', 'ZOMATO.NS', 'RELIANCE.NS'];

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
              onClick={() => onSelectTicker?.(t)}
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
            <span>{reliability}</span>
            <span className="text-[10px] text-neutral-400 font-normal">%</span>
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
            <div
              key={idx}
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
                {/* What Management Promised */}
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-mono text-[10px] uppercase font-semibold">
                    <Mic className="w-3 h-3" />
                    <span>Concall Promise ({audit.concallDate})</span>
                  </div>
                  <p className="text-neutral-200 text-xs leading-relaxed italic">
                    &ldquo;{audit.promisedGuidance}&rdquo;
                  </p>
                  <div className="text-[10px] text-neutral-400 font-mono">
                    Citation: {audit.concallCitation}
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
                  <div className="text-[10px] text-neutral-400 font-mono">
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
