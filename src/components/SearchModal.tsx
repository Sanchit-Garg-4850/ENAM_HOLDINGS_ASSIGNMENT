'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Sparkles, Building2 } from 'lucide-react';
import { PORTFOLIO_COMPANIES } from '@/data/portfolio';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTicker: (ticker: string) => void;
  currentTicker: string;
}

export function SearchModal({
  isOpen,
  onClose,
  onSelectTicker,
  currentTicker,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    if (!query.trim()) {
      // Show portfolio companies by default
      setResults(
        PORTFOLIO_COMPANIES.map((c) => ({
          ticker: c.ticker,
          symbol: c.symbol,
          name: c.name,
          sector: c.sector,
          isPortfolio: c.isPortfolio,
          isCustom: false,
        }))
      );
      return;
    }

    const q = query.trim().toUpperCase();
    const matched = PORTFOLIO_COMPANIES.filter(
      (c) =>
        c.symbol.includes(q) ||
        c.name.toUpperCase().includes(q) ||
        c.ticker.includes(q)
    ).map((c) => ({
      ticker: c.ticker,
      symbol: c.symbol,
      name: c.name,
      sector: c.sector,
      isPortfolio: c.isPortfolio,
      isCustom: false,
    }));

    // If query has 2+ characters and isn't already an exact match, allow dynamic lookup
    const hasExact = matched.some((m) => m.symbol === q || m.ticker === `${q}.NS`);
    if (!hasExact && q.length >= 2) {
      matched.unshift({
        ticker: `${q}.NS`,
        symbol: q,
        name: `${q} (Any NSE Listed Ticker)`,
        sector: 'Dynamic On-Demand Generalization',
        isPortfolio: false,
        isCustom: true,
      });
    }

    setResults(matched);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-neutral-800 flex items-center gap-2.5">
          <Search className="w-4 h-4 text-emerald-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company or enter any NSE ticker (e.g. TITAN, ZOMATO)..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 outline-none font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 rounded bg-neutral-800 text-neutral-400 hover:text-white text-xs font-mono"
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto divide-y divide-neutral-850 p-1 flex-1">
          {results.map((item) => {
            const isSelected = item.ticker === currentTicker;

            return (
              <button
                key={item.ticker}
                onClick={() => {
                  onSelectTicker(item.ticker);
                  onClose();
                }}
                className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all ${
                  isSelected
                    ? 'bg-neutral-800/80 border border-emerald-500/30'
                    : 'hover:bg-neutral-850'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                      item.isCustom
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : item.isPortfolio
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {item.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-sm">
                        {item.symbol}
                      </span>
                      {item.isPortfolio && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Portfolio
                        </span>
                      )}
                      {item.isCustom && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Dynamic Live Fetch
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-400 truncate max-w-[280px]">
                      {item.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-500 hidden sm:inline">
                    {item.sector}
                  </span>
                  <ArrowRight className="w-4 h-4 text-neutral-500" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
