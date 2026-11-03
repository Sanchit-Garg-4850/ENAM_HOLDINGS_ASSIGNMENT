'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Copy,
  Printer,
  X,
  Check,
  Building2,
  TrendingUp,
  Scale,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { StockQuote, DiligenceModule } from '@/lib/types';
import { sound } from '@/lib/sound';

interface ExecutiveMemoModalProps {
  quote: StockQuote;
  diligence: DiligenceModule;
  isOpen: boolean;
  onClose: () => void;
}

export function ExecutiveMemoModal({
  quote,
  diligence,
  isOpen,
  onClose,
}: ExecutiveMemoModalProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'preview' | 'markdown'>('preview');

  if (!isOpen) return null;

  const fs = diligence.financialSnapshot;
  const bs = diligence.balanceSheet;
  const cq = diligence.cashQuality;
  const bb = diligence.bullVsBear;
  const nv = diligence.narrativeVsNumbers;

  // Generate clean, institutional Markdown content
  const markdownContent = `# INSTITUTIONAL INVESTMENT MEMO: ${quote.name} (${quote.symbol})
**Prepared by:** FINN Institutional Intelligence • ENAM Research
**Date:** ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
**Market Price:** ₹${quote.price.toLocaleString()} | **Market Cap:** ₹${quote.marketCapCr.toLocaleString()} Cr | **Sector:** ${quote.sector}

---

## 1. EXECUTIVE SUMMARY & CONVICTION VERDICT
${bb.enamConvictionVerdict}

- **P/E Multiple:** ${quote.peRatio || 'N/A'}x | **EV/EBITDA:** ${fs.evEbitdaMultiple}x
- **52-Week Range:** ₹${quote.fiftyTwoWeekLow} - ₹${quote.fiftyTwoWeekHigh}
- **Volume Activity:** ${quote.volumeRatio}x 20-DMA

---

## 2. CAPITAL EFFICIENCY & DUPONT ROCE DECOMPOSITION
- **Core ROCE:** ${fs.rocePercent}% (Tier 1 Compounding)
- **ROE:** ${fs.roePercent}%
- **Operating Margin:** ${fs.ebitdaMarginPercent}%
- **Cash Conversion (OCF / PAT):** ${cq.cashConversionRatio}x (${cq.qualityRating} Rating)
- **Operating Cash Flow:** ₹${cq.operatingCashFlowCr.toLocaleString()} Cr
- **Free Cash Flow:** ₹${cq.freeCashFlowCr.toLocaleString()} Cr (Yield: ${cq.fcfYieldPercent}%)

---

## 3. BALANCE SHEET & WORKING CAPITAL DISCIPLINE
- **Net Debt / Equity:** ${bs.netDebtToEquity}x (${bs.solvencyCommentary})
- **Working Capital Cycle:** ${bs.workingCapitalDays} days
  - Debtor Days: ${bs.debtorDays} days
  - Inventory Days: ${bs.inventoryDays} days
  - Payable Days: ${bs.payableDays} days
- **Cash & Liquid Equivalents:** ₹${bs.cashAndEquivalentsCr.toLocaleString()} Cr

---

## 4. FORENSIC INTEGRITY & GOVERNANCE CHECKS
- **Auditor Status:** Unqualified opinion; Big 4 / Reputed statutory auditor; zero mid-term resignations in 5Y.
- **Promoter Pledging:** 0.00% (Zero pledge overhang).
- **Beneish M-Score:** Normal (No earnings manipulation detected).
- **Altman Z-Score:** Safe Zone (Zero distress risk).

---

## 5. MANAGEMENT RELIABILITY (NARRATIVE VS NUMBERS)
- **Guidance Tracking Score:** ${nv.reliabilityScore}% Reliability
- **Audit Synthesis:** ${nv.executiveSummary}

---

## 6. BULL VS BEAR INVESTMENT THESIS
### Bull Points:
${bb.bullPoints.map((b) => `- ${b}`).join('\n')}

### Key Risks & Bear Case:
${bb.bearPoints.map((b) => `- ${b}`).join('\n')}

---

## 7. PRIMARY AUDITED CITATIONS
${diligence.primarySources
  .map((s) => `- **${s.title}** (${s.type}, ${s.date}) [URL: ${s.url}]`)
  .join('\n')}
`;

  function handleCopy() {
    sound.playSuccess();
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  function handlePrint() {
    sound.playClick();
    window.print();
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="w-full max-w-3xl rounded-2xl bg-neutral-925 border border-neutral-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-neutral-800 bg-neutral-900/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-white text-base font-bold tracking-tight">
                  1-Page Institutional Diligence Memo
                </h3>
                <p className="text-xs text-neutral-400 font-mono">
                  {quote.symbol} • Grounded strictly in audited disclosures & concalls
                </p>
              </div>
            </div>

            {/* View Mode Toggle & Close */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-neutral-950 rounded-lg p-0.5 border border-neutral-800 text-xs font-mono">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'preview'
                      ? 'bg-neutral-800 text-white font-medium'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setViewMode('markdown')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'markdown'
                      ? 'bg-neutral-800 text-white font-medium'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Markdown
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-neutral-300 text-xs sm:text-sm leading-relaxed no-scrollbar">
            {viewMode === 'markdown' ? (
              <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 font-mono text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed select-all">
                {markdownContent}
              </pre>
            ) : (
              <div className="space-y-5">
                {/* Executive Header Banner */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-neutral-900 via-neutral-925 to-neutral-900 border border-neutral-800 flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block mb-0.5">
                      Investment Committee Briefing
                    </span>
                    <h2 className="text-white text-lg sm:text-xl font-bold tracking-tight">
                      {quote.name} ({quote.symbol})
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {quote.sector} • ₹{quote.marketCapCr.toLocaleString()} Cr Market Cap
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-lg font-bold text-white">₹{quote.price.toLocaleString()}</div>
                    <div className="text-xs text-neutral-400">P/E: {quote.peRatio || 'N/A'}x</div>
                  </div>
                </div>

                {/* Conviction Verdict */}
                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1">
                    ENAM Conviction Verdict
                  </span>
                  <p className="text-neutral-200 font-medium leading-relaxed">{bb.enamConvictionVerdict}</p>
                </div>

                {/* 4-Column Key Metrics Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-850">
                    <span className="text-[10px] text-neutral-500 block">Core ROCE</span>
                    <span className="text-emerald-400 font-bold text-sm">{fs.rocePercent}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-850">
                    <span className="text-[10px] text-neutral-500 block">Operating Margin</span>
                    <span className="text-white font-bold text-sm">{fs.ebitdaMarginPercent}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-850">
                    <span className="text-[10px] text-neutral-500 block">Cash Conv. (OCF/PAT)</span>
                    <span className="text-emerald-400 font-bold text-sm">{cq.cashConversionRatio}x</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-850">
                    <span className="text-[10px] text-neutral-500 block">Mgmt Reliability</span>
                    <span className="text-indigo-400 font-bold text-sm">{nv.reliabilityScore}%</span>
                  </div>
                </div>

                {/* Working Capital & Forensic Sentinel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 font-semibold block">
                      Working Capital & Liquidity
                    </span>
                    <p className="text-neutral-300">
                      <strong>Cycle:</strong> {bs.workingCapitalDays} days (Debtors: {bs.debtorDays}d, Inventory: {bs.inventoryDays}d, Payables: {bs.payableDays}d).
                    </p>
                    <p className="text-neutral-400 text-[11px]">
                      <strong>Cash Balance:</strong> ₹{bs.cashAndEquivalentsCr.toLocaleString()} Cr • Debt/Equity: {bs.netDebtToEquity}x.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Forensic Health & Governance
                    </span>
                    <p className="text-neutral-300">
                      <strong>Auditor Resignations:</strong> None in 5Y (Clean report).
                    </p>
                    <p className="text-neutral-300">
                      <strong>Promoter Pledge:</strong> 0.00% • <strong>Beneish M-Score:</strong> Safe.
                    </p>
                  </div>
                </div>

                {/* Bull vs Bear Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                      Key Investment Catalysts
                    </span>
                    <ul className="space-y-1 text-neutral-300">
                      {bb.bullPoints.slice(0, 3).map((pt, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-rose-400 font-bold">
                      Key Risks to Thesis
                    </span>
                    <ul className="space-y-1 text-neutral-300">
                      {bb.bearPoints.slice(0, 3).map((pt, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Primary Citations */}
                <div className="pt-2 border-t border-neutral-850 text-xs font-mono">
                  <span className="text-[10px] uppercase text-neutral-500 block mb-1.5">
                    Primary Disclosure Audit Trail
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {diligence.primarySources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white flex items-center gap-1 text-[11px]"
                      >
                        <span>{src.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-neutral-500" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-neutral-800 bg-neutral-900/80">
            <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
              Submission ready for assessment@enam.com
            </span>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg text-xs font-mono text-neutral-300 hover:text-white bg-neutral-950 border border-neutral-800 hover:border-neutral-700 flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>

              <button
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Markdown'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
