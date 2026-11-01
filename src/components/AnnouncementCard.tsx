'use client';

import React from 'react';
import {
  ExternalLink,
  TrendingUp,
  TrendingDown,
  UserCheck,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Announcement } from '@/lib/types';
import { CATEGORY_REGISTRY } from '@/lib/classification';

interface AnnouncementCardProps {
  announcement: Announcement;
  onSelectTicker?: (ticker: string) => void;
}

export function AnnouncementCard({ announcement, onSelectTicker }: AnnouncementCardProps) {
  const catInfo = CATEGORY_REGISTRY[announcement.category] || CATEGORY_REGISTRY.unclassified;
  const isUrgent = announcement.tier === 'tier1_urgent';

  return (
    <article
      className={`rounded-xl border transition-all p-4 ${
        isUrgent
          ? 'bg-neutral-900/90 border-neutral-750 shadow-md shadow-neutral-950/50'
          : 'bg-neutral-925/70 border-neutral-850 hover:border-neutral-750'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Ticker Chip */}
          <button
            onClick={() => onSelectTicker?.(announcement.ticker)}
            className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-mono font-bold text-xs tracking-wide transition-colors"
          >
            {announcement.ticker.replace('.NS', '')}
          </button>

          {/* Category Pill */}
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${catInfo.badgeBg} ${catInfo.badgeText}`}
          >
            {catInfo.label}
          </span>

          {/* Tier 1 Urgent Indicator */}
          {isUrgent && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30">
              High Impact
            </span>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-1 shrink-0">
          <Clock className="w-3 h-3 text-neutral-500" />
          {announcement.publishedAt}
        </span>
      </div>

      {/* Main Headline */}
      <h3 className="text-white text-sm sm:text-base font-semibold leading-snug tracking-tight mb-2">
        {announcement.headline}
      </h3>

      {/* One-Line Takeaway (Investment Signal) */}
      <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-850/80 mb-3 text-xs text-neutral-300 leading-relaxed flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-neutral-400 font-medium">Why you care: </span>
          <span>{announcement.oneLineTakeaway}</span>
        </div>
      </div>

      {/* ENRICHED COMPONENT 1: Quarterly Results 4-Box Headline Grid */}
      {announcement.results && (
        <div className="mb-3.5 pt-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2 flex items-center justify-between">
            <span>{announcement.results.quarter} Headline Financials</span>
            <span className="text-neutral-500">Period: {announcement.results.periodEnded}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Revenue */}
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-400 font-mono">Revenue</span>
              <div className="text-sm sm:text-base font-bold font-mono text-white mt-0.5">
                ₹{announcement.results.revenue.toLocaleString()} <span className="text-[10px] text-neutral-400 font-normal">Cr</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono">
                <span className={announcement.results.revenueYoY >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {announcement.results.revenueYoY >= 0 ? '+' : ''}{announcement.results.revenueYoY}% YoY
                </span>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400">
                  {announcement.results.revenueQoQ >= 0 ? '+' : ''}{announcement.results.revenueQoQ}% QoQ
                </span>
              </div>
            </div>

            {/* EBITDA */}
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-400 font-mono">EBITDA ({announcement.results.ebitdaMargin}%)</span>
              <div className="text-sm sm:text-base font-bold font-mono text-white mt-0.5">
                ₹{announcement.results.ebitda.toLocaleString()} <span className="text-[10px] text-neutral-400 font-normal">Cr</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono">
                <span className={announcement.results.ebitdaYoY >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {announcement.results.ebitdaYoY >= 0 ? '+' : ''}{announcement.results.ebitdaYoY}% YoY
                </span>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400">
                  {announcement.results.ebitdaQoQ >= 0 ? '+' : ''}{announcement.results.ebitdaQoQ}% QoQ
                </span>
              </div>
            </div>

            {/* PBT */}
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-400 font-mono">PBT</span>
              <div className="text-sm sm:text-base font-bold font-mono text-white mt-0.5">
                ₹{announcement.results.pbt.toLocaleString()} <span className="text-[10px] text-neutral-400 font-normal">Cr</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono">
                <span className={announcement.results.pbtYoY >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {announcement.results.pbtYoY >= 0 ? '+' : ''}{announcement.results.pbtYoY}% YoY
                </span>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400">
                  {announcement.results.pbtQoQ >= 0 ? '+' : ''}{announcement.results.pbtQoQ}% QoQ
                </span>
              </div>
            </div>

            {/* PAT */}
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-400 font-mono">PAT (Margin: {announcement.results.patMargin}%)</span>
              <div className="text-sm sm:text-base font-bold font-mono text-white mt-0.5">
                ₹{announcement.results.pat.toLocaleString()} <span className="text-[10px] text-neutral-400 font-normal">Cr</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono">
                <span className={announcement.results.patYoY >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {announcement.results.patYoY >= 0 ? '+' : ''}{announcement.results.patYoY}% YoY
                </span>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400">
                  {announcement.results.patQoQ >= 0 ? '+' : ''}{announcement.results.patQoQ}% QoQ
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ENRICHED COMPONENT 2: Management Change Bio & Context */}
      {announcement.managementChange && (
        <div className="mb-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold text-amber-300">
              Incoming Profile: {announcement.managementChange.personName}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
              {announcement.managementChange.experienceYears}y exp
            </span>
          </div>

          <div className="space-y-1.5 text-neutral-300 text-[11px] leading-relaxed">
            <p>
              <strong className="text-neutral-200">New Role:</strong> {announcement.managementChange.role}
            </p>
            {announcement.managementChange.priorCompany && (
              <p>
                <strong className="text-neutral-200">Prior Pedigree:</strong> {announcement.managementChange.priorCompany}
              </p>
            )}
            {announcement.managementChange.education && (
              <p>
                <strong className="text-neutral-200">Education:</strong> {announcement.managementChange.education}
              </p>
            )}
            <p className="text-neutral-400 pt-1">
              <strong className="text-amber-400/90">Significance:</strong> {announcement.managementChange.significance}
            </p>
          </div>
        </div>
      )}

      {/* ENRICHED COMPONENT 3: Market Anomaly Spike */}
      {announcement.anomaly && (
        <div className="mb-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-blue-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-blue-400" />
              Volume Spike: {announcement.anomaly.volumeSpikeRatio}x 20-DMA
            </span>
            <span
              className={`font-mono font-bold text-xs ${
                announcement.anomaly.priceChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {announcement.anomaly.priceChangePercent >= 0 ? '+' : ''}
              {announcement.anomaly.priceChangePercent}%
            </span>
          </div>
          <p className="text-neutral-300 text-[11px] leading-relaxed">{announcement.anomaly.headline}</p>
        </div>
      )}

      {/* Bottom Action Footer with Primary PDF link */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-850/60 text-[11px]">
        <button
          onClick={() => onSelectTicker?.(announcement.ticker)}
          className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>Deep-dive {announcement.ticker.replace('.NS', '')}</span>
          <span>→</span>
        </button>

        {announcement.sourceFilingUrl && (
          <a
            href={announcement.sourceFilingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-neutral-200 flex items-center gap-1 font-mono transition-colors"
          >
            <FileText className="w-3 h-3 text-neutral-500" />
            <span>Primary PDF</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>
    </article>
  );
}
