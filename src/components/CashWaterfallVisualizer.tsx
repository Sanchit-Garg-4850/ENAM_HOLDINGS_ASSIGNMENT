'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, ArrowDown, Droplets, Zap } from 'lucide-react';
import { DiligenceModule } from '@/lib/types';

interface CashWaterfallVisualizerProps {
  diligence: DiligenceModule;
  symbol: string;
}

export function CashWaterfallVisualizer({ diligence, symbol }: CashWaterfallVisualizerProps) {
  const fs = diligence.financialSnapshot;
  const cq = diligence.cashQuality;
  const bs = diligence.balanceSheet;

  const rev = fs.ttmRevenueCr || 1000;
  const ebitda = Number((rev * (fs.ebitdaMarginPercent / 100)).toFixed(0));
  const pat = fs.ttmPatCr || Number((ebitda * 0.6).toFixed(0));
  const ocf = cq.operatingCashFlowCr || Number((pat * cq.cashConversionRatio).toFixed(0));
  const fcf = cq.freeCashFlowCr || Number((ocf * 0.7).toFixed(0));
  const capex = Math.max(0, ocf - fcf);

  const steps = [
    { label: 'Gross Sales Revenue', value: rev, type: 'start', desc: 'Total money received from customers' },
    { label: 'Core Operating Expenses', value: -(rev - ebitda), type: 'negative', desc: 'COGS, raw materials, labor, overheads' },
    { label: 'Operating EBITDA', value: ebitda, type: 'subtotal', desc: 'Core business profitability before tax/depr' },
    { label: 'Taxes, Interest & Depreciation', value: -(ebitda - pat), type: 'negative', desc: 'Statutory income tax and debt servicing' },
    { label: 'Reported Net Profit (PAT)', value: pat, type: 'subtotal', desc: 'Accounting profit left for shareholders' },
    {
      label: ocf >= pat ? 'Working Capital Accretion' : 'Working Capital Drag',
      value: ocf - pat,
      type: ocf >= pat ? 'positive' : 'negative',
      desc: ocf >= pat ? 'Negative working capital generates upfront cash' : 'Cash trapped in receivables & unpaid inventory',
    },
    { label: 'Real Cash from Operations (OCF)', value: ocf, type: 'highlight', desc: 'True cash generated in the bank account' },
    { label: 'Growth & Maintenance Capex', value: -capex, type: 'negative', desc: 'Spend on new plants, stores, equipment' },
    { label: 'Surplus Free Cash Flow (FCF)', value: fcf, type: 'final', desc: 'Cash genuinely left over for dividends / buybacks' },
  ];

  return (
    <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h4 className="text-white text-sm font-semibold flex items-center gap-2">
            <Droplets className="w-4 h-4 text-emerald-400" />
            Cash Conversion Waterfall: Profit vs. Real Cash
          </h4>
          <p className="text-xs text-neutral-400">
            Traces whether accounting profits genuinely transform into cash or remain trapped in working capital.
          </p>
        </div>

        {/* Quality Rating Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono">
          <span className="text-neutral-400">Conversion Ratio:</span>
          <span className={`font-bold ${cq.cashConversionRatio >= 1.0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {cq.cashConversionRatio}x OCF/PAT
          </span>
        </div>
      </div>

      {/* Visual Step Bars */}
      <div className="space-y-2 pt-2">
        {steps.map((step, idx) => {
          const isNegative = step.value < 0;
          const isHighlight = step.type === 'highlight' || step.type === 'final';

          return (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border transition-all text-xs font-mono ${
                isHighlight
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-neutral-900/60 border-neutral-850 hover:border-neutral-750'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`font-semibold ${isHighlight ? 'text-emerald-300' : 'text-neutral-200'}`}>
                  {step.label}
                </span>
                <span
                  className={`font-bold text-sm ${
                    step.value > 0
                      ? isHighlight
                        ? 'text-emerald-400'
                        : 'text-white'
                      : 'text-rose-400'
                  }`}
                >
                  {step.value > 0 ? '+' : ''}₹{Math.abs(step.value).toLocaleString()} Cr
                </span>
              </div>
              <div className="text-[10px] text-neutral-400 font-sans mt-0.5">{step.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Cash Red Flag Diagnostic */}
      <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-xs flex items-start gap-2.5">
        {cq.cashConversionRatio >= 1.0 ? (
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <span className="font-bold text-white block">
            {cq.cashConversionRatio >= 1.0
              ? 'Institutional Quality: High Cash Conversion'
              : 'Caution: Operating Cash Lagging Accounting Profits'}
          </span>
          <p className="text-neutral-300 text-[11px] leading-relaxed">{cq.assessment}</p>
        </div>
      </div>
    </div>
  );
}
