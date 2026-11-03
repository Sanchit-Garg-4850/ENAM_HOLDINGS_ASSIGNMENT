'use client';

import React, { useState } from 'react';
import {
  Layers,
  TrendingUp,
  Percent,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Droplets,
  Scale,
  Sparkles,
} from 'lucide-react';
import { DiligenceModule, StockQuote } from '@/lib/types';
import { sound } from '@/lib/sound';

interface FinancialAnalyticsProps {
  diligence: DiligenceModule;
  quote: StockQuote;
}

export function FinancialAnalyticsCharts({ diligence, quote }: FinancialAnalyticsProps) {
  const [activeChart, setActiveChart] = useState<'workingCapital' | 'dupont' | 'reinvestment' | 'valuation'>('workingCapital');

  const fs = diligence.financialSnapshot;
  const bs = diligence.balanceSheet;
  const cq = diligence.cashQuality;

  // Working Capital metrics
  const debtorDays = bs.debtorDays || 12;
  const inventoryDays = bs.inventoryDays || 64;
  const payableDays = bs.payableDays || 58;
  const netCycleDays = bs.workingCapitalDays || (debtorDays + inventoryDays - payableDays);

  // DuPont metrics
  const operatingMargin = fs.ebitdaMarginPercent || 15.2;
  const roce = fs.rocePercent || 22.4;
  const roe = fs.roePercent || 18.6;
  const assetTurnover = Number((roce / operatingMargin).toFixed(2)) || 1.45;

  // Capex Reinvestment metrics
  const ocf = cq.operatingCashFlowCr || 1200;
  const fcf = cq.freeCashFlowCr || 800;
  const capex = Math.max(0, ocf - fcf);
  const reinvestmentRate = ocf > 0 ? Math.min(100, Math.round((capex / ocf) * 100)) : 40;

  // Valuation metrics
  const currentPrice = quote.price;
  const low52 = quote.fiftyTwoWeekLow;
  const high52 = quote.fiftyTwoWeekHigh;
  const rangeSpan = Math.max(1, high52 - low52);
  const pricePercentile = Math.max(0, Math.min(100, Math.round(((currentPrice - low52) / rangeSpan) * 100)));

  return (
    <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 space-y-4 shadow-sm transition-all">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h4 className="text-white text-sm font-bold tracking-tight">Institutional Financial Analytics</h4>
          </div>
          <p className="text-xs text-neutral-400">
            Decomposed capital efficiency, working capital drag, and reinvestment quality.
          </p>
        </div>

        {/* Minimalist Chart Selector Pills */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-850 overflow-x-auto no-scrollbar">
          {[
            { id: 'workingCapital', label: 'Cash Cycle' },
            { id: 'dupont', label: 'DuPont ROCE' },
            { id: 'reinvestment', label: 'Capex/OCF' },
            { id: 'valuation', label: '52W Band' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveChart(tab.id as any);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono whitespace-nowrap transition-all ${
                activeChart === tab.id
                  ? 'bg-neutral-800 text-emerald-400 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Working Capital & Cash Conversion Cycle Chart */}
      {activeChart === 'workingCapital' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Cash Conversion Cycle Breakdown
            </span>
            <span className={`font-bold px-2 py-0.5 rounded ${netCycleDays <= 30 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
              Net: {netCycleDays} Days {netCycleDays < 0 ? '(Negative WC Advantage)' : ''}
            </span>
          </div>

          {/* Stacked Metric Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {/* Debtor Days */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-neutral-400">Debtor Days (DSO)</span>
                <span className="font-bold text-white">{debtorDays}d</span>
              </div>
              <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(100, (debtorDays / 90) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-neutral-500 block">Days to collect customer receivables</span>
            </div>

            {/* Inventory Days */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-neutral-400">Inventory Days (DIO)</span>
                <span className="font-bold text-white">{inventoryDays}d</span>
              </div>
              <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(100, (inventoryDays / 120) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-neutral-500 block">Days inventory remains on shelves/warehouse</span>
            </div>

            {/* Payable Days */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-neutral-400">Payable Days (DPO)</span>
                <span className="font-bold text-emerald-400">{payableDays}d</span>
              </div>
              <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, (payableDays / 120) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-neutral-500 block">Days taken to pay trade suppliers</span>
            </div>
          </div>

          {/* Financial Diagnostic Pill */}
          <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-850 text-[11px] font-mono text-neutral-300 flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              Formula: DSO ({debtorDays}d) + DIO ({inventoryDays}d) - DPO ({payableDays}d) = {netCycleDays} Days
            </span>
            <span className="text-neutral-400">
              {netCycleDays <= 25 ? 'High Cash Velocity • Minimal Drag' : 'Working Capital Drag Present'}
            </span>
          </div>
        </div>
      )}

      {/* 2. DuPont ROCE & Capital Efficiency Decomposition */}
      {activeChart === 'dupont' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-300 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-emerald-400" />
              DuPont 3-Stage Return on Capital Architecture
            </span>
            <span className="font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
              Core ROCE: {roce}%
            </span>
          </div>

          {/* DuPont Multiplier Visual Pipeline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850">
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">1. Pricing Power</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold font-mono text-white">{operatingMargin}%</span>
                <span className="text-[10px] text-neutral-400 font-mono">EBITDA Margin</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1">Gross margin strength and pricing moat</p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850">
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">2. Capital Velocity</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold font-mono text-emerald-400">{assetTurnover}x</span>
                <span className="text-[10px] text-neutral-400 font-mono">Asset Turns</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1">Sales generated per ₹1 of capital employed</p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850">
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">3. Equity Return</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold font-mono text-white">{roe}%</span>
                <span className="text-[10px] text-neutral-400 font-mono">ROE Net</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1">Net profit delivered on shareholder funds</p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-850 text-[11px] font-mono text-neutral-400">
            Insight: High returns driven primarily by <strong className="text-white">{operatingMargin >= 15 ? 'Operating Margin Power' : 'Asset Velocity'}</strong>. Financial leverage is <strong className="text-emerald-400">{bs.netDebtToEquity <= 0.3 ? 'Conservatively Low' : 'Moderate'}</strong>.
          </div>
        </div>
      )}

      {/* 3. Capex Reinvestment & Cash Flow Self-Funding Gauge */}
      {activeChart === 'reinvestment' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-300 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-emerald-400" />
              Capex Reinvestment vs. Cash Generation
            </span>
            <span className="font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
              {reinvestmentRate}% Reinvestment Rate
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {/* Visual Reinvestment Bar */}
            <div className="h-4 rounded-lg bg-neutral-950 border border-neutral-800 p-0.5 flex overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-md transition-all duration-500"
                style={{ width: `${reinvestmentRate}%` }}
                title={`Growth Capex: ₹${capex.toLocaleString()} Cr`}
              />
              <div
                className="h-full bg-blue-500/40 rounded-md transition-all duration-500"
                style={{ width: `${100 - reinvestmentRate}%` }}
                title={`Surplus FCF: ₹${fcf.toLocaleString()} Cr`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded bg-emerald-500"></span> Capex: ₹{capex.toLocaleString()} Cr ({reinvestmentRate}%)
              </span>
              <span className="flex items-center gap-1 text-blue-400">
                <span className="w-2 h-2 rounded bg-blue-500/60"></span> Surplus FCF: ₹{fcf.toLocaleString()} Cr ({100 - reinvestmentRate}%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
              <span className="text-[10px] text-neutral-400 block">Operating Cash Flow (OCF)</span>
              <span className="font-bold text-white text-sm">₹{ocf.toLocaleString()} Cr</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
              <span className="text-[10px] text-neutral-400 block">Free Cash Flow (FCF)</span>
              <span className="font-bold text-emerald-400 text-sm">₹{fcf.toLocaleString()} Cr</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. 52-Week Valuation Band Gauge */}
      {activeChart === 'valuation' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              52-Week Range & Valuation Multiple Position
            </span>
            <span className="font-bold text-white">
              {pricePercentile}th Percentile
            </span>
          </div>

          {/* 52W Range Track with Current Pointer */}
          <div className="space-y-2 pt-2">
            <div className="relative h-2 rounded-full bg-neutral-800">
              <div
                className="absolute top-0 bottom-0 left-0 bg-emerald-500/60 rounded-full"
                style={{ width: `${pricePercentile}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-400 border-2 border-neutral-900 shadow-md"
                style={{ left: `calc(${pricePercentile}% - 8px)` }}
                title={`Current: ₹${currentPrice}`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono">
              <div className="text-left">
                <span className="text-[10px] text-neutral-500 block">52W Low</span>
                <span className="text-neutral-300 font-bold">₹{low52.toLocaleString()}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-emerald-400 block">Current Quote</span>
                <span className="text-white font-bold">₹{currentPrice.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-500 block">52W High</span>
                <span className="text-neutral-300 font-bold">₹{high52.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-850 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
            <span>Trading at {quote.peRatio || 35}x P/E</span>
            <span className="text-neutral-300">
              {pricePercentile > 80 ? 'Near Upper 52W Boundary' : pricePercentile < 30 ? 'Near Lower Support' : 'Mid-Range Accumulation'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
