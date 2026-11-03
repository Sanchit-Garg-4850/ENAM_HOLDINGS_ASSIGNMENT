'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  PieChart,
  DollarSign,
  Scale,
  ShieldAlert,
  Compass,
  FileCheck,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
} from 'lucide-react';
import { StockQuote, DiligenceModule } from '@/lib/types';
import { PORTFOLIO_COMPANIES } from '@/data/portfolio';
import { InteractiveFinancialChart } from './InteractiveFinancialChart';
import { CashWaterfallVisualizer } from './CashWaterfallVisualizer';
import { PeerComparisonMatrix } from './PeerComparisonMatrix';
import { AnimatedCounter } from './AnimatedCounter';
import { FinancialAnalyticsCharts } from './FinancialAnalyticsCharts';
import { ExecutiveMemoModal } from './ExecutiveMemoModal';
import { sound } from '@/lib/sound';

interface PullDiligenceProps {
  quote: StockQuote;
  diligence: DiligenceModule;
  onSelectTicker: (ticker: string) => void;
  onOpenSearch: () => void;
}

export function PullDiligence({
  quote,
  diligence,
  onSelectTicker,
  onOpenSearch,
}: PullDiligenceProps) {
  const [activeModuleTab, setActiveModuleTab] = useState<
    'snapshot' | 'trajectory' | 'balanceSheet' | 'cash' | 'guidance' | 'thesis' | 'peers' | 'analytics'
  >('snapshot');
  const [isMemoOpen, setIsMemoOpen] = useState<boolean>(false);

  // Derive sector peers dynamically from PORTFOLIO_COMPANIES for 1-tap comparison
  const relevantPeers = React.useMemo(() => {
    const sameSector = PORTFOLIO_COMPANIES.filter(
      (c) => c.sector === quote.sector && c.ticker !== quote.ticker
    );
    if (sameSector.length >= 3) return sameSector.slice(0, 5);
    const others = PORTFOLIO_COMPANIES.filter(
      (c) => c.ticker !== quote.ticker && !sameSector.some((s) => s.ticker === c.ticker)
    );
    return [...sameSector, ...others].slice(0, 5);
  }, [quote.sector, quote.ticker]);

  const fs = diligence.financialSnapshot;
  const bs = diligence.balanceSheet;
  const cq = diligence.cashQuality;
  const tr = diligence.trajectory;
  const gl = diligence.guidanceLedger;
  const bb = diligence.bullVsBear;

  return (
    <div className="space-y-4 pb-20">
      {/* Ticker Selector Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 hover:text-white shrink-0 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-emerald-400" />
          <span>Search Ticker</span>
        </button>
        {PORTFOLIO_COMPANIES.slice(0, 10).map((c) => (
          <button
            key={c.ticker}
            onClick={() => onSelectTicker(c.ticker)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all border ${
              quote.ticker === c.ticker
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold'
                : 'bg-neutral-900/60 border-neutral-850 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {c.symbol}
          </button>
        ))}
      </div>

      {/* Stock Quote Hero Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-925 to-neutral-950 border border-neutral-800 shadow-md">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-white text-lg sm:text-xl font-bold tracking-tight">
                {quote.name}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-800 text-emerald-400 border border-neutral-700 font-semibold">
                {quote.symbol}
              </span>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsMemoOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-mono font-medium transition-colors"
                title="Generate 1-Page Institutional Diligence Memo"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1-Page Memo</span>
              </button>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {quote.sector} • {quote.marketCapCategory} • Market Cap: ₹{quote.marketCapCr.toLocaleString()} Cr
            </p>
          </div>

          {/* Price & Day Change */}
          <div className="text-right">
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
              <AnimatedCounter value={quote.price} decimals={2} prefix="₹" />
            </div>
            <div
              className={`text-xs font-mono font-medium flex items-center justify-end gap-1 ${
                quote.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {quote.changePercent >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>
                {quote.changePercent >= 0 ? '+' : ''}
                {quote.change} ({quote.changePercent >= 0 ? '+' : ''}
                {quote.changePercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* Key Quick Multiples Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-neutral-800/80 text-xs font-mono">
          <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-850">
            <span className="text-[10px] text-neutral-400 block">P/E Multiple</span>
            <span className="font-bold text-white text-sm">{quote.peRatio || 'N/A'}x</span>
          </div>
          <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-850">
            <span className="text-[10px] text-neutral-400 block">Volume Multiplier</span>
            <span
              className={`font-bold text-sm ${
                quote.volumeRatio >= 2.0 ? 'text-blue-400' : 'text-neutral-200'
              }`}
            >
              {quote.volumeRatio}x 20-DMA
            </span>
          </div>
          <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-850">
            <span className="text-[10px] text-neutral-400 block">52W Range</span>
            <span className="font-bold text-white text-xs">
              ₹{quote.fiftyTwoWeekLow} - ₹{quote.fiftyTwoWeekHigh}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-850">
            <span className="text-[10px] text-neutral-400 block">Cash Conv. (OCF/PAT)</span>
            <span
              className={`font-bold text-sm ${
                cq.cashConversionRatio >= 1.0 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {cq.cashConversionRatio}x ({cq.qualityRating})
            </span>
          </div>
        </div>

        {/* One-Tap Sector Peer Chips */}
        {relevantPeers.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-neutral-800/80 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-neutral-400 font-mono shrink-0 flex items-center gap-1">
              <Users className="w-3 h-3 text-emerald-400" />
              <span>Sector Peers:</span>
            </span>
            {relevantPeers.map((peer) => (
              <button
                key={peer.ticker}
                onClick={() => {
                  sound.playClick();
                  onSelectTicker(peer.ticker);
                }}
                className="px-2 py-0.5 rounded-md bg-neutral-950/70 hover:bg-neutral-800 border border-neutral-850 hover:border-neutral-700 text-xs font-mono text-neutral-300 hover:text-emerald-400 transition-colors shrink-0 flex items-center gap-1"
                title={`Switch diligence to ${peer.name}`}
              >
                <span>{peer.symbol}</span>
                <span className="text-[9px] text-neutral-500">₹{peer.basePrice}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Diligence Modules Sub-Navigation */}
      <div className="flex items-center gap-1 bg-neutral-900/90 border border-neutral-800 rounded-xl p-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'snapshot', label: '1. Business & Financials' },
          { id: 'trajectory', label: '2. Multi-Year Trajectory' },
          { id: 'balanceSheet', label: '3. Balance Sheet Health' },
          { id: 'cash', label: '4. Cash Quality' },
          { id: 'guidance', label: '5. Forward Guidance' },
          { id: 'thesis', label: '6. Bull vs Bear' },
          { id: 'peers', label: '7. Peer Benchmarks' },
          { id: 'analytics', label: '8. Capital Analytics' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              sound.playClick();
              setActiveModuleTab(tab.id as any);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
              activeModuleTab === tab.id
                ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeModuleTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {/* MODULE TAB 1: Business & Financial Snapshot */}
          {activeModuleTab === 'snapshot' && (
        <div className="space-y-3">
          {/* Business Overview & Moat */}
          <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
            <h3 className="text-white text-sm font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              Business Model & Competitive Moat
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {diligence.businessSnapshot.overview}
            </p>
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 text-xs">
              <span className="text-emerald-400 font-mono font-semibold block text-[10px] uppercase mb-1">
                Strategic Moat
              </span>
              <p className="text-neutral-300">{diligence.businessSnapshot.competitiveMoat}</p>
            </div>
          </div>

          {/* Segment Breakdown */}
          <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800">
            <h3 className="text-white text-sm font-semibold flex items-center gap-2 mb-3">
              <PieChart className="w-4 h-4 text-emerald-400" />
              Segmental Revenue Mix
            </h3>
            <div className="space-y-2.5">
              {diligence.businessSnapshot.segments.map((seg, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850 text-xs">
                  <div className="flex items-center justify-between font-mono mb-1">
                    <span className="text-white font-semibold">{seg.name}</span>
                    <span className="text-emerald-400 font-bold">{seg.sharePercent}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-neutral-850 h-1.5 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${seg.sharePercent}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-neutral-400">{seg.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Headline Numbers Grid */}
          <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800">
            <h3 className="text-white text-sm font-semibold flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Current Headline Financials (TTM)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
                <span className="text-[10px] text-neutral-400 block">TTM Revenue</span>
                <span className="text-sm font-bold text-white">₹{fs.ttmRevenueCr.toLocaleString()} Cr</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
                <span className="text-[10px] text-neutral-400 block">EBITDA Margin</span>
                <span className="text-sm font-bold text-emerald-400">{fs.ebitdaMarginPercent}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
                <span className="text-[10px] text-neutral-400 block">TTM PAT</span>
                <span className="text-sm font-bold text-white">₹{fs.ttmPatCr.toLocaleString()} Cr</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
                <span className="text-[10px] text-neutral-400 block">ROCE / ROE</span>
                <span className="text-sm font-bold text-indigo-400">{fs.rocePercent}% / {fs.roePercent}%</span>
              </div>
            </div>
          </div>

          {/* Institutional Decomposed Financial Analytics */}
          <FinancialAnalyticsCharts diligence={diligence} quote={quote} />
        </div>
      )}

      {/* MODULE TAB 2: Multi-Year Trajectory */}
      {activeModuleTab === 'trajectory' && (
        <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-white text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Multi-Year Compounding Trajectory
            </h3>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                tr.marginDirection === 'expanding'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              Margin: {tr.marginDirection}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
              <span className="text-[10px] text-neutral-400 block">3-Year Revenue CAGR</span>
              <span className="text-base font-bold text-emerald-400">+{tr.threeYearRevenueCagr}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
              <span className="text-[10px] text-neutral-400 block">3-Year PAT CAGR</span>
              <span className="text-base font-bold text-emerald-400">+{tr.threeYearPatCagr}%</span>
            </div>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
            {tr.marginSummary}
          </p>

          {/* Interactive Trajectory Chart */}
          <InteractiveFinancialChart
            data={tr.multiYearFinancials.map((f) => ({
              period: f.year,
              revenue: f.revenue,
              ebitda: f.ebitda,
              margin: f.margin,
              pat: f.pat,
            }))}
            symbol={quote.symbol}
          />

          {/* Multi-Year Table */}
          <div className="overflow-x-auto rounded-lg border border-neutral-850">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-950 text-neutral-400 text-[10px] uppercase">
                <tr>
                  <th className="p-2">Period</th>
                  <th className="p-2">Revenue (₹Cr)</th>
                  <th className="p-2">EBITDA (₹Cr)</th>
                  <th className="p-2">Margin</th>
                  <th className="p-2">PAT (₹Cr)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850 text-neutral-200">
                {tr.multiYearFinancials.map((row) => (
                  <tr key={row.year} className="hover:bg-neutral-850/50">
                    <td className="p-2 font-bold text-white">{row.year}</td>
                    <td className="p-2">{row.revenue.toLocaleString()}</td>
                    <td className="p-2">{row.ebitda.toLocaleString()}</td>
                    <td className="p-2 text-emerald-400">{row.margin}%</td>
                    <td className="p-2">{row.pat.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODULE TAB 3: Balance Sheet Health */}
      {activeModuleTab === 'balanceSheet' && (
        <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
          <h3 className="text-white text-sm font-semibold flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            Balance Sheet & Leverage Ratios
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
              <span className="text-[10px] text-neutral-400 block">Net Debt / Equity</span>
              <span
                className={`text-sm font-bold ${
                  bs.netDebtToEquity <= 0.3 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {bs.netDebtToEquity}x
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
              <span className="text-[10px] text-neutral-400 block">Total Borrowings</span>
              <span className="text-sm font-bold text-white">₹{bs.totalDebtCr.toLocaleString()} Cr</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
              <span className="text-[10px] text-neutral-400 block">Cash & Equivalents</span>
              <span className="text-sm font-bold text-white">₹{bs.cashAndEquivalentsCr.toLocaleString()} Cr</span>
            </div>
          </div>

          {/* Working Capital Cycle */}
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-400">Working Capital Cycle:</span>
              <span className="text-white font-bold">{bs.workingCapitalDays} Days</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-center">
              <div className="p-1.5 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-500 block text-[9px]">Debtor Days</span>
                <span className="text-neutral-300 font-semibold">{bs.debtorDays}d</span>
              </div>
              <div className="p-1.5 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-500 block text-[9px]">Inventory Days</span>
                <span className="text-neutral-300 font-semibold">{bs.inventoryDays}d</span>
              </div>
              <div className="p-1.5 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-500 block text-[9px]">Payable Days</span>
                <span className="text-neutral-300 font-semibold">{bs.payableDays}d</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
            {bs.solvencyCommentary}
          </p>
        </div>
      )}

      {/* MODULE TAB 4: Cash Quality & Red Flag Detector */}
      {activeModuleTab === 'cash' && (
        <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-white text-sm font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Cash Quality & Red Flag Sentinel
            </h3>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                cq.qualityRating === 'High'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {cq.qualityRating} Cash Quality
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
              <span className="text-[10px] text-neutral-400 block">Cash Conv. (OCF/PAT)</span>
              <span
                className={`text-base font-bold ${
                  cq.cashConversionRatio >= 1.0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {cq.cashConversionRatio}x
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
              <span className="text-[10px] text-neutral-400 block">Operating Cash (OCF)</span>
              <span className="text-sm font-bold text-white">₹{cq.operatingCashFlowCr.toLocaleString()} Cr</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
              <span className="text-[10px] text-neutral-400 block">Free Cash Flow (FCF)</span>
              <span className="text-sm font-bold text-emerald-400">₹{cq.freeCashFlowCr.toLocaleString()} Cr</span>
            </div>
          </div>

          {/* Cash Flow Waterfall Visualizer */}
          <CashWaterfallVisualizer diligence={diligence} symbol={quote.symbol} />

          <p className="text-xs text-neutral-300 leading-relaxed p-3 rounded-lg bg-neutral-950 border border-neutral-850">
            {cq.assessment}
          </p>
        </div>
      )}

      {/* MODULE TAB 7: Peer Benchmarking */}
      {activeModuleTab === 'peers' && (
        <PeerComparisonMatrix onSelectTicker={onSelectTicker} activeTicker={quote.ticker} />
      )}

      {/* MODULE TAB 5: Forward Guidance Ledger */}
      {activeModuleTab === 'guidance' && (
        <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-white text-sm font-semibold flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              Forward Guidance Ledger
            </h3>
            <span className="text-[10px] font-mono text-neutral-400">
              Source: {gl.latestCallQuarter}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
              <span className="text-[10px] text-neutral-400 block">Revenue Target</span>
              <span className="text-xs font-bold text-white">{gl.forwardRevenueGrowth}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
              <span className="text-[10px] text-neutral-400 block">Margin Corridor</span>
              <span className="text-xs font-bold text-emerald-400">{gl.forwardMarginBand}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
              <span className="text-[10px] text-neutral-400 block">Capex Guidance</span>
              <span className="text-xs font-bold text-white">{gl.capexGuidanceCr}</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="text-[10px] font-mono uppercase text-neutral-400">
              Verbatim Management Remarks
            </div>
            {gl.keyManagementQuotes.map((q, i) => (
              <div key={i} className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 text-xs space-y-1">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-indigo-400 font-semibold">{q.speaker}</span>
                  <span className="text-neutral-500">Topic: {q.topic}</span>
                </div>
                <p className="text-neutral-300 italic">&ldquo;{q.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE TAB 6: Bull vs Bear Case */}
      {activeModuleTab === 'thesis' && (
        <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
          <h3 className="text-white text-sm font-semibold flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            High-Conviction Bull vs. Bear Case
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Bull Points */}
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                The Bull Thesis (Primary Data)
              </span>
              <ul className="space-y-1.5 text-xs text-neutral-300">
                {bb.bullPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 shrink-0 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bear Points */}
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 space-y-2">
              <span className="text-xs font-mono font-bold text-rose-400 uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                The Bear Sentinel (Downside Risks)
              </span>
              <ul className="space-y-1.5 text-xs text-neutral-300">
                {bb.bearPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-500 shrink-0 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Conviction Verdict */}
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs">
            <span className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">
              ENAM Conviction Takeaway
            </span>
            <p className="text-white font-medium">{bb.enamConvictionVerdict}</p>
          </div>
        </div>
      )}

      {/* MODULE TAB 8: Capital Analytics & Ratios */}
      {activeModuleTab === 'analytics' && (
        <div className="space-y-4">
          <FinancialAnalyticsCharts diligence={diligence} quote={quote} />
        </div>
      )}
        </motion.div>
      </AnimatePresence>

      {/* Primary Sources & Citations Footer */}
      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 text-xs">
        <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-2">
          Primary Grounding Disclosures
        </span>
        <div className="flex items-center gap-3 flex-wrap">
          {diligence.primarySources.map((s, i) => (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] text-neutral-300 hover:text-emerald-400 transition-colors font-mono"
            >
              <FileCheck className="w-3.5 h-3.5 text-neutral-500" />
              <span>{s.title}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ))}
        </div>
      </div>

      {/* 1-Click Executive Diligence Memo Modal */}
      <ExecutiveMemoModal
        quote={quote}
        diligence={diligence}
        isOpen={isMemoOpen}
        onClose={() => setIsMemoOpen(false)}
      />
    </div>
  );
}
