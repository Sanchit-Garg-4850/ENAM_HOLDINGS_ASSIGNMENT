'use client';

import React, { useState } from 'react';
import { Columns3, CheckCircle2, ArrowRight, Scale, TrendingUp } from 'lucide-react';
import { PORTFOLIO_COMPANIES } from '@/data/portfolio';
import { PRIMARY_DILIGENCE_STORE } from '@/data/diligence';
import { sound } from '@/lib/sound';

interface PeerComparisonMatrixProps {
  onSelectTicker: (ticker: string) => void;
  activeTicker: string;
}

export function PeerComparisonMatrix({ onSelectTicker, activeTicker }: PeerComparisonMatrixProps) {
  const [selectedTickers, setSelectedTickers] = useState<string[]>([
    'TRENT.NS',
    'DIXON.NS',
    'ZOMATO.NS',
    'RELIANCE.NS',
  ]);
  const [dynamicDiligenceMap, setDynamicDiligenceMap] = useState<Record<string, any>>({});

  // Dynamically fetch live research for all selected tickers
  React.useEffect(() => {
    selectedTickers.forEach(async (t) => {
      if (!dynamicDiligenceMap[t]) {
        try {
          const res = await fetch(`/api/research?ticker=${encodeURIComponent(t)}`);
          const json = await res.json();
          if (json.success && json.diligence) {
            setDynamicDiligenceMap((prev) => ({ ...prev, [t]: json.diligence }));
          }
        } catch (err) {
          console.warn('Failed to fetch dynamic diligence for peer:', err);
        }
      }
    });
  }, [selectedTickers, dynamicDiligenceMap]);

  const presetComparisons = [
    { label: 'High-Growth Champions', tickers: ['TRENT.NS', 'DIXON.NS', 'ZOMATO.NS'] },
    { label: 'Mega-Cap Leaders', tickers: ['RELIANCE.NS', 'HDFCBANK.NS', 'TCS.NS'] },
    { label: 'Capital Goods & Infra', tickers: ['LT.NS', 'POLYCAB.NS', 'ASTRAL.NS'] },
  ];

  function toggleTicker(t: string) {
    sound.playClick();
    if (selectedTickers.includes(t)) {
      if (selectedTickers.length > 2) {
        setSelectedTickers(selectedTickers.filter((x) => x !== t));
      }
    } else {
      if (selectedTickers.length < 4) {
        setSelectedTickers([...selectedTickers, t]);
      }
    }
  }

  // Get data for each ticker dynamically
  const peers = selectedTickers.map((t) => {
    const meta = PORTFOLIO_COMPANIES.find((c) => c.ticker === t) || {
      ticker: t,
      symbol: t.replace('.NS', ''),
      name: t,
      sector: 'Diversified',
      basePrice: 1000,
      marketCapCr: 50000,
      peRatio: 35,
    };
    const diligence = PRIMARY_DILIGENCE_STORE[t] || dynamicDiligenceMap[t];

    return {
      ticker: t,
      symbol: meta.symbol,
      name: meta.name,
      sector: meta.sector,
      mcapCr: meta.marketCapCr,
      pe: meta.peRatio,
      margin: diligence?.financialSnapshot.ebitdaMarginPercent || 16.5,
      roce: diligence?.financialSnapshot.rocePercent || 22.0,
      de: diligence?.balanceSheet.netDebtToEquity || 0.1,
      cashConv: diligence?.cashQuality.cashConversionRatio || 1.15,
      reliability: diligence?.narrativeVsNumbers.reliabilityScore || 85,
      verdict: diligence?.bullVsBear.enamConvictionVerdict || 'Quality compounder with disciplined capital allocation.',
    };
  });

  return (
    <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h4 className="text-white text-sm font-semibold flex items-center gap-2">
            <Columns3 className="w-4 h-4 text-emerald-400" />
            Peer Diligence & Benchmark Matrix
          </h4>
          <p className="text-xs text-neutral-400">
            Compare fundamental metrics, cash conversion quality, and management reliability side-by-side.
          </p>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {presetComparisons.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                sound.playClick();
                setSelectedTickers(p.tickers);
              }}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-[11px] font-mono text-neutral-300 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ticker Selector Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <span className="text-[10px] font-mono text-neutral-500 shrink-0">Toggle (max 4):</span>
        {PORTFOLIO_COMPANIES.slice(0, 10).map((c) => {
          const isSelected = selectedTickers.includes(c.ticker);
          return (
            <button
              key={c.ticker}
              onClick={() => toggleTicker(c.ticker)}
              className={`px-2 py-0.5 rounded text-xs font-mono transition-all border ${
                isSelected
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {c.symbol}
            </button>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-lg border border-neutral-850">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-neutral-900/90 text-neutral-400 text-[10px] uppercase">
            <tr>
              <th className="p-3">Financial Metric</th>
              {peers.map((p) => (
                <th key={p.ticker} className="p-3 text-white">
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>{p.symbol}</span>
                    <button
                      onClick={() => {
                        sound.playClick();
                        onSelectTicker(p.ticker);
                      }}
                      className="text-[9px] text-emerald-400 hover:underline lowercase font-sans ml-1"
                    >
                      open
                    </button>
                  </div>
                  <div className="text-[9px] text-neutral-500 font-normal truncate max-w-[110px]">
                    {p.sector}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-850 text-neutral-200">
            <tr>
              <td className="p-3 text-neutral-400">Market Cap</td>
              {peers.map((p) => (
                <td key={p.ticker} className="p-3 font-semibold text-white">
                  ₹{p.mcapCr.toLocaleString()} Cr
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 text-neutral-400">P/E Valuation</td>
              {peers.map((p) => (
                <td key={p.ticker} className="p-3">
                  {p.pe}x
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 text-neutral-400">EBITDA Margin</td>
              {peers.map((p) => (
                <td key={p.ticker} className="p-3 font-semibold text-emerald-400">
                  {p.margin}%
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 text-neutral-400">ROCE</td>
              {peers.map((p) => (
                <td key={p.ticker} className="p-3 text-indigo-400 font-semibold">
                  {p.roce}%
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 text-neutral-400">Net Debt / Equity</td>
              {peers.map((p) => (
                <td key={p.ticker} className="p-3">
                  {p.de}x
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 text-neutral-400">Cash Conversion (OCF/PAT)</td>
              {peers.map((p) => (
                <td key={p.ticker} className="p-3 font-bold text-emerald-400">
                  {p.cashConv}x
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 text-neutral-400">Mgmt Reliability</td>
              {peers.map((p) => (
                <td key={p.ticker} className="p-3">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                    {p.reliability}%
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 text-neutral-400">ENAM Verdict</td>
              {peers.map((p) => (
                <td key={p.ticker} className="p-3 text-[11px] font-sans text-neutral-300 leading-snug">
                  {p.verdict}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
