'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, ArrowRight } from 'lucide-react';
import { sound } from '@/lib/sound';

interface NotificationToastProps {
  onSelectTicker: (ticker: string) => void;
}

interface ToastAlert {
  ticker: string;
  symbol: string;
  badge: string;
  title: string;
  detail: string;
  metric?: string;
  isUrgent: boolean;
}

export function NotificationToast({ onSelectTicker }: NotificationToastProps) {
  const [alert, setAlert] = useState<ToastAlert | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function fetchTopLiveAlert() {
      try {
        const res = await fetch('/api/announcements?windowHours=24&onlyMaterial=true');
        const json = await res.json();

        if (!isCancelled && json.success && Array.isArray(json.data) && json.data.length > 0) {
          // Prioritize active live market anomalies, else top material announcement
          const anomalyItem = json.data.find((a: any) => a.anomaly);
          const topItem = anomalyItem || json.data[0];

          if (topItem) {
            const sym = topItem.ticker.replace(/\.(NS|BO)$/, '');
            let title = topItem.headline;
            let detail = topItem.oneLineTakeaway;
            let metric: string | undefined = undefined;

            if (topItem.anomaly) {
              const ratio = topItem.anomaly.volumeSpikeRatio;
              const chg = topItem.anomaly.priceChangePercent;
              title = `${sym}: ${ratio}x Volume Surge (${chg >= 0 ? '+' : ''}${chg}%)`;
              detail = `Traded ${topItem.anomaly.currentVolume?.toLocaleString()} shares vs 10-DMA avg of ${topItem.anomaly.avgVolume20d?.toLocaleString()} shares. Current price ₹${topItem.anomaly.currentPrice?.toLocaleString()}.`;
              metric = `${ratio}x Vol`;
            } else if (topItem.results) {
              metric = `${topItem.results.revenueYoY >= 0 ? '+' : ''}${topItem.results.revenueYoY}% YoY`;
            }

            setAlert({
              ticker: topItem.ticker,
              symbol: sym,
              badge: topItem.anomaly ? 'Live Market Anomaly' : 'Tier 1 Exchange Filing',
              title,
              detail,
              metric,
              isUrgent: topItem.tier === 'tier1_urgent',
            });
          }
        }
      } catch (err) {
        console.warn('Toast failed to load live alert:', err);
      }
    }

    fetchTopLiveAlert();

    // Trigger toast display after short delay to demonstrate proactive push
    const timer = setTimeout(() => {
      if (!hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sound.playChime();
      }
    }, 2200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [hasShown]);

  // Auto-dismiss toast after 7 seconds so it doesn't linger
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 7000);
    return () => clearTimeout(timer);
  }, [isVisible]);

  if (!alert) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          className="fixed bottom-20 sm:bottom-6 left-3 sm:left-auto right-3 sm:right-6 z-50 max-w-sm sm:max-w-md bg-neutral-900/95 backdrop-blur-xl border border-emerald-500/40 rounded-2xl shadow-2xl p-3.5 shadow-emerald-950/40"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  {alert.badge}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">Live NSE/BSE</span>
              </div>

              <div className="text-xs font-bold text-white mt-0.5 truncate">
                {alert.title}
              </div>

              <p className="text-[11px] text-neutral-300 mt-0.5 leading-snug line-clamp-2">
                {alert.detail}
              </p>

              <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-neutral-800">
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsVisible(false);
                    onSelectTicker(alert.ticker);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-[11px] font-mono flex items-center gap-1 transition-colors"
                >
                  <span>Inspect {alert.symbol} Diligence</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="px-2 py-1 text-[11px] text-neutral-400 hover:text-white font-mono"
                >
                  Dismiss
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsVisible(false)}
              className="text-neutral-500 hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
