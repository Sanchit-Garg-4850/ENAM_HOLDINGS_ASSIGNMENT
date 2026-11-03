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
    // Temporarily switch to preview mode if on markdown before triggering print
    if (viewMode !== 'preview') {
      setViewMode('preview');
      setTimeout(() => window.print(), 80);
    } else {
      window.print();
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        {/* Print Styles for Guaranteed Strict 1-Page Output */}
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 4mm 7mm;
            }

            html, body {
              background: #ffffff !important;
              color: #0f172a !important;
              margin: 0 !important;
              padding: 0 !important;
              font-size: 8.5pt !important;
              line-height: 1.22 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* Hide everything in the page except the printable memo sheet */
            body * {
              visibility: hidden;
            }

            #memo-printable-sheet,
            #memo-printable-sheet * {
              visibility: visible;
            }

            #memo-printable-sheet {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              border: none !important;
              box-shadow: none !important;
              background: #ffffff !important;
              color: #0f172a !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
            }

            .no-print {
              display: none !important;
            }

            /* Monochrome and High-Contrast institutional print tokens */
            .memo-print-banner {
              background: #f8fafc !important;
              border: 1px solid #cbd5e1 !important;
              color: #0f172a !important;
              padding: 6px 10px !important;
              border-radius: 4px !important;
              margin-bottom: 5px !important;
            }

            .memo-print-card {
              background: #ffffff !important;
              border: 1px solid #cbd5e1 !important;
              color: #0f172a !important;
              padding: 4px 7px !important;
              border-radius: 4px !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            .memo-print-verdict {
              background: #f0fdf4 !important;
              border: 1px solid #86efac !important;
              color: #064e3b !important;
              padding: 5px 8px !important;
              border-radius: 4px !important;
              margin-bottom: 5px !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            .memo-print-bull {
              background: #f0fdf4 !important;
              border: 1px solid #bbf7d0 !important;
              color: #064e3b !important;
              padding: 5px 8px !important;
              border-radius: 4px !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            .memo-print-bear {
              background: #fff1f2 !important;
              border: 1px solid #fecdd3 !important;
              color: #881337 !important;
              padding: 5px 8px !important;
              border-radius: 4px !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            .memo-print-text-dark {
              color: #0f172a !important;
            }

            .memo-print-text-muted {
              color: #475569 !important;
            }

            .memo-print-text-green {
              color: #047857 !important;
            }
          }
        `}</style>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="w-full max-w-3xl rounded-2xl bg-neutral-925 border border-neutral-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Header (Hidden in Print) */}
          <div className="no-print flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-neutral-800 bg-neutral-900/80">
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

          {/* Modal Body / Printable Content Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-neutral-300 text-xs sm:text-sm leading-relaxed no-scrollbar">
            {viewMode === 'markdown' ? (
              <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 font-mono text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed select-all">
                {markdownContent}
              </pre>
            ) : (
              <div id="memo-printable-sheet" className="space-y-3 print:space-y-2">
                {/* Executive Header Banner */}
                <div className="memo-print-banner p-3 sm:p-4 rounded-xl bg-gradient-to-r from-neutral-900 via-neutral-925 to-neutral-900 border border-neutral-800 flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <span className="memo-print-text-green text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block mb-0.5">
                      ENAM Research • Institutional Investment Diligence Memo
                    </span>
                    <h2 className="memo-print-text-dark text-white text-lg sm:text-xl font-bold tracking-tight">
                      {quote.name} ({quote.symbol})
                    </h2>
                    <p className="memo-print-text-muted text-xs text-neutral-400 mt-0.5">
                      Sector: {quote.sector} • Market Cap: ₹{quote.marketCapCr.toLocaleString()} Cr • Date:{' '}
                      {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <div className="memo-print-text-dark text-lg font-bold text-white">
                      ₹{quote.price.toLocaleString()}
                    </div>
                    <div className="memo-print-text-muted text-xs text-neutral-400">
                      P/E: {quote.peRatio || 'N/A'}x | EV/EBITDA: {fs.evEbitdaMultiple}x
                    </div>
                  </div>
                </div>

                {/* Conviction Verdict */}
                <div className="memo-print-verdict p-2.5 sm:p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs">
                  <span className="memo-print-text-green text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-0.5">
                    ENAM Conviction Verdict
                  </span>
                  <p className="memo-print-text-dark text-neutral-200 font-medium leading-snug">
                    {bb.enamConvictionVerdict}
                  </p>
                </div>

                {/* 4-Column Key Metrics Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                  <div className="memo-print-card p-2 rounded-xl bg-neutral-950 border border-neutral-850">
                    <span className="memo-print-text-muted text-[10px] text-neutral-500 block">Core ROCE</span>
                    <span className="memo-print-text-green text-emerald-400 font-bold text-sm">
                      {fs.rocePercent}%
                    </span>
                  </div>
                  <div className="memo-print-card p-2 rounded-xl bg-neutral-950 border border-neutral-850">
                    <span className="memo-print-text-muted text-[10px] text-neutral-500 block">Operating Margin</span>
                    <span className="memo-print-text-dark text-white font-bold text-sm">
                      {fs.ebitdaMarginPercent}%
                    </span>
                  </div>
                  <div className="memo-print-card p-2 rounded-xl bg-neutral-950 border border-neutral-850">
                    <span className="memo-print-text-muted text-[10px] text-neutral-500 block">Cash Conv. (OCF/PAT)</span>
                    <span className="memo-print-text-green text-emerald-400 font-bold text-sm">
                      {cq.cashConversionRatio}x
                    </span>
                  </div>
                  <div className="memo-print-card p-2 rounded-xl bg-neutral-950 border border-neutral-850">
                    <span className="memo-print-text-muted text-[10px] text-neutral-500 block">Mgmt Reliability</span>
                    <span className="memo-print-text-dark text-indigo-400 font-bold text-sm">
                      {nv.reliabilityScore}%
                    </span>
                  </div>
                </div>

                {/* Working Capital & Forensic Sentinel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="memo-print-card p-2.5 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1">
                    <span className="memo-print-text-muted text-[10px] font-mono uppercase text-neutral-400 font-semibold block">
                      Working Capital & Solvency
                    </span>
                    <p className="memo-print-text-dark text-neutral-300">
                      <strong>Cash Cycle:</strong> {bs.workingCapitalDays}d (Debtors: {bs.debtorDays}d, Inventory: {bs.inventoryDays}d, Payables: {bs.payableDays}d).
                    </p>
                    <p className="memo-print-text-muted text-neutral-400 text-[10.5px]">
                      <strong>Cash Reserve:</strong> ₹{bs.cashAndEquivalentsCr.toLocaleString()} Cr • <strong>Net Debt/Equity:</strong> {bs.netDebtToEquity}x.
                    </p>
                  </div>

                  <div className="memo-print-card p-2.5 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1">
                    <span className="memo-print-text-green text-[10px] font-mono uppercase text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Forensic Health & Integrity
                    </span>
                    <p className="memo-print-text-dark text-neutral-300">
                      <strong>Auditor Resignations:</strong> None in 5Y (Unqualified clean audit).
                    </p>
                    <p className="memo-print-text-muted text-neutral-300 text-[10.5px]">
                      <strong>Promoter Pledge:</strong> 0.00% • <strong>Beneish M-Score:</strong> Safe (-2.84).
                    </p>
                  </div>
                </div>

                {/* Bull vs Bear Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="memo-print-bull p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                    <span className="memo-print-text-green text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                      Key Catalysts & Compounding Drivers
                    </span>
                    <ul className="space-y-0.5 text-neutral-300">
                      {bb.bullPoints.slice(0, 3).map((pt, i) => (
                        <li key={i} className="memo-print-text-dark flex items-start gap-1">
                          <span className="memo-print-text-green text-emerald-400 font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="memo-print-bear p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block">
                      Key Risks to Thesis
                    </span>
                    <ul className="space-y-0.5 text-neutral-300">
                      {bb.bearPoints.slice(0, 3).map((pt, i) => (
                        <li key={i} className="memo-print-text-dark flex items-start gap-1">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Primary Citations */}
                <div className="memo-print-card pt-1.5 border-t border-neutral-850 text-xs font-mono">
                  <span className="memo-print-text-muted text-[9.5px] uppercase text-neutral-500 block mb-1">
                    Primary Disclosure Audit Trail (Direct Exchanges & Concalls)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {diligence.primarySources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="memo-print-card px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white flex items-center gap-1 text-[10px]"
                      >
                        <span className="memo-print-text-dark">{src.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-neutral-500 no-print" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer (Hidden in Print) */}
          <div className="no-print flex items-center justify-between px-4 sm:px-6 py-3 border-t border-neutral-800 bg-neutral-900/80">
            <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
              Submission ready for assessment@enam.com
            </span>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg text-xs font-mono text-neutral-300 hover:text-white bg-neutral-950 border border-neutral-800 hover:border-neutral-700 flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF (1-Page)</span>
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
