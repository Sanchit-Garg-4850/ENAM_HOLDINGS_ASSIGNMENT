'use client';

import React, { useState } from 'react';
import { Sliders, Bell, X, Check, RotateCcw } from 'lucide-react';
import { AlertConfig, AnnouncementCategory } from '@/lib/types';

interface AlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AlertConfig;
  onSaveConfig: (newConfig: AlertConfig) => void;
}

export function AlertSettingsModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}: AlertSettingsModalProps) {
  const [volMultiplier, setVolMultiplier] = useState(config.volumeMultiplierThreshold);
  const [priceMove, setPriceMove] = useState(config.priceMoveThresholdPercent);
  const [onlyMaterial, setOnlyMaterial] = useState(config.onlyMaterial);

  const availableCategories: Array<{ id: AnnouncementCategory; label: string }> = [
    { id: 'results', label: 'Quarterly Results' },
    { id: 'unusual_activity', label: 'Market Anomalies' },
    { id: 'management_change', label: 'Management Changes' },
    { id: 'M&A', label: 'M&A & Restructuring' },
    { id: 'litigation', label: 'Litigation & Regulatory' },
    { id: 'capex', label: 'Capex & Expansions' },
    { id: 'pledging', label: 'Promoter Pledging' },
    { id: 'credit_rating', label: 'Credit Ratings' },
  ];

  const [selectedCats, setSelectedCats] = useState<AnnouncementCategory[]>(
    config.monitoredCategories
  );

  if (!isOpen) return null;

  function toggleCat(cat: AnnouncementCategory) {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter((c) => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  }

  function handleSave() {
    onSaveConfig({
      volumeMultiplierThreshold: volMultiplier,
      priceMoveThresholdPercent: priceMove,
      onlyMaterial,
      monitoredCategories: selectedCats,
    });
    onClose();
  }

  function handleReset() {
    setVolMultiplier(2.0);
    setPriceMove(3.0);
    setOnlyMaterial(true);
    setSelectedCats(['results', 'management_change', 'M&A', 'capex', 'pledging', 'litigation']);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-white text-sm font-bold">Triggered Alert Rules</h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Configure what qualifies as &ldquo;unusual&rdquo; across your portfolio. FINN monitors end-of-day volumes, daily swings, and high-impact disclosures against these thresholds.
        </p>

        {/* Slider 1: Volume Anomaly Multiplier */}
        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-300">Volume Spike Threshold</span>
            <span className="font-bold text-emerald-400 text-sm">{volMultiplier.toFixed(1)}x 20-DMA</span>
          </div>
          <input
            type="range"
            min="1.2"
            max="5.0"
            step="0.1"
            value={volMultiplier}
            onChange={(e) => setVolMultiplier(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>1.2x (Sensitive)</span>
            <span>2.0x (Standard)</span>
            <span>5.0x (Severe)</span>
          </div>
        </div>

        {/* Slider 2: Daily Price Move Threshold */}
        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-300">Price Move Threshold</span>
            <span className="font-bold text-emerald-400 text-sm">±{priceMove.toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="10.0"
            step="0.5"
            value={priceMove}
            onChange={(e) => setPriceMove(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>±1.0% (Tight)</span>
            <span>±3.0% (Standard)</span>
            <span>±10.0% (Extreme)</span>
          </div>
        </div>

        {/* Category Toggles */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-neutral-400 uppercase">
            Monitored Announcement Categories:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {availableCategories.map((cat) => {
              const active = selectedCats.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCat(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                    active
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-medium'
                      : 'bg-neutral-950 border-neutral-850 text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
          <button
            type="button"
            onClick={handleReset}
            className="text-neutral-400 hover:text-white text-xs font-mono flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-mono hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold font-mono transition-colors"
            >
              Apply Rules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
