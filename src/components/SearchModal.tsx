'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles, Building2, AlertCircle, CornerDownLeft } from 'lucide-react';
import { PORTFOLIO_COMPANIES } from '@/data/portfolio';

interface SearchResultItem {
  ticker: string;
  symbol: string;
  name: string;
  sector: string;
  isPortfolio: boolean;
  isVerified: boolean;
}

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
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [didYouMean, setDidYouMean] = useState<SearchResultItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setDidYouMean(null);
      setSelectedIndex(0);
      // Pre-fill with portfolio companies
      setResults(
        PORTFOLIO_COMPANIES.map((c) => ({
          ticker: c.ticker,
          symbol: c.symbol,
          name: c.name,
          sector: c.sector,
          isPortfolio: true,
          isVerified: true,
        }))
      );
    }
  }, [isOpen]);

  // Debounced API search
  useEffect(() => {
    if (!isOpen) return;

    if (!query.trim()) {
      setResults(
        PORTFOLIO_COMPANIES.map((c) => ({
          ticker: c.ticker,
          symbol: c.symbol,
          name: c.name,
          sector: c.sector,
          isPortfolio: true,
          isVerified: true,
        }))
      );
      setDidYouMean(null);
      setSelectedIndex(0);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.results || []);
          setDidYouMean(data.didYouMean || null);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Keyboard navigation (Arrow keys + Enter + Escape)
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const total = results.length + (didYouMean ? 1 : 0);
          return total > 0 ? (prev + 1) % total : 0;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const total = results.length + (didYouMean ? 1 : 0);
          return total > 0 ? (prev - 1 + total) % total : 0;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (didYouMean && selectedIndex === 0) {
          onSelectTicker(didYouMean.ticker);
          onClose();
        } else {
          const resultOffset = didYouMean ? 1 : 0;
          const actualIndex = selectedIndex - resultOffset;
          if (actualIndex >= 0 && results[actualIndex]) {
            onSelectTicker(results[actualIndex].ticker);
            onClose();
          } else if (didYouMean) {
            onSelectTicker(didYouMean.ticker);
            onClose();
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, didYouMean, selectedIndex, onSelectTicker, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[82vh]">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-neutral-800 flex items-center gap-2.5 bg-neutral-950/60">
          <Search className="w-4 h-4 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 4,500+ Indian equities or symbol (e.g. HAL, RELIANCE, TITAN)..."
            className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 outline-none font-mono"
          />
          {isLoading && (
            <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          {query && !isLoading && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
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

        {/* Typo Correction Banner ("Did you mean?") */}
        {didYouMean && (
          <div className="p-3 border-b border-amber-500/20 bg-amber-500/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-amber-200">
                  No exact ticker for &ldquo;{query}&rdquo;. Did you mean{' '}
                  <span className="font-bold underline text-white">{didYouMean.symbol}</span>?
                </div>
                <div className="text-[11px] text-neutral-400 truncate">
                  {didYouMean.name} &bull; {didYouMean.sector}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                onSelectTicker(didYouMean.ticker);
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
            >
              <span>Switch to {didYouMean.symbol}</span>
              <CornerDownLeft className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Results List */}
        <div className="overflow-y-auto divide-y divide-neutral-850 p-1 flex-1">
          {results.length > 0 ? (
            results.map((item, idx) => {
              const isSelected = item.ticker === currentTicker;
              const resultOffset = didYouMean ? 1 : 0;
              const isFocused = selectedIndex === idx + resultOffset;

              return (
                <button
                  key={item.ticker}
                  onClick={() => {
                    onSelectTicker(item.ticker);
                    onClose();
                  }}
                  className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all ${
                    isFocused
                      ? 'bg-neutral-800 border border-neutral-700'
                      : isSelected
                      ? 'bg-neutral-800/60 border border-emerald-500/30'
                      : 'hover:bg-neutral-850 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        item.isPortfolio
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-neutral-800 text-neutral-200 border border-neutral-750'
                      }`}
                    >
                      {item.symbol.slice(0, 3)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">
                          {item.symbol}
                        </span>
                        {item.isPortfolio && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Portfolio
                          </span>
                        )}
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                          NSE Live
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400 truncate max-w-[320px]">
                        {item.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-neutral-500 hidden sm:inline max-w-[140px] truncate">
                      {item.sector}
                    </span>
                    <ArrowRight className="w-4 h-4 text-neutral-500" />
                  </div>
                </button>
              );
            })
          ) : !isLoading && !didYouMean ? (
            <div className="p-8 text-center">
              <Building2 className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <div className="text-sm text-neutral-300 font-medium">No Indian equity matching &ldquo;{query}&rdquo;</div>
              <div className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                Check the ticker spelling or search by company name (e.g. &ldquo;Hindustan Aeronautics&rdquo;, &ldquo;Reliance&rdquo;).
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer Hints */}
        <div className="p-2.5 px-3.5 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-750">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-750">↵</kbd> Select</span>
            <span><kbd className="px-1 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-750">Esc</kbd> Close</span>
          </div>
          <span className="hidden sm:inline text-neutral-400">4,500+ NSE Stocks Dynamic</span>
        </div>
      </div>
    </div>
  );
}
