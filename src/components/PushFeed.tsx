'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '@/lib/sound';
import {
  SlidersHorizontal,
  ChevronDown,
  Filter,
  Layers,
  Sparkles,
  Zap,
  RefreshCw,
  Scale,
  ExternalLink,
  ShieldAlert,
  Star,
  FileCheck,
  Building2,
  Radio,
} from 'lucide-react';
import { Announcement, AnnouncementCategory } from '@/lib/types';
import { AnnouncementCard } from './AnnouncementCard';
import { QuickPeekModal } from './QuickPeekModal';
import { useWatchlist } from '@/lib/useWatchlist';
import { SebiRssItem } from '@/lib/rss';

interface CacheEntry {
  data: Announcement[];
  collapsedRoutineCount: number;
  timestamp: number;
}

// Module-level in-memory cache preserved across tab switches
const PUSH_FEED_CACHE: Record<string, CacheEntry> = {};

interface PushFeedProps {
  onSelectTicker: (ticker: string) => void;
  onOpenAlertSettings: () => void;
  onClearUrgent?: () => void;
  onNavigateAudit?: (ticker: string) => void;
}

export function PushFeed({
  onSelectTicker,
  onOpenAlertSettings,
  onClearUrgent,
  onNavigateAudit,
}: PushFeedProps) {
  // Feed view mode: Portfolio disclosures vs live SEBI regulatory RSS
  const [feedMode, setFeedMode] = useState<'portfolio' | 'sebi_rss'>('portfolio');

  // Watchlist integration
  const { isWatchlisted, watchlistCount } = useWatchlist();
  const [isWatchlistOnly, setIsWatchlistOnly] = useState<boolean>(false);

  // Portfolio feed states
  const [windowHours, setWindowHours] = useState<number>(24);
  const [onlyMaterial, setOnlyMaterial] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<AnnouncementCategory | 'ALL'>('ALL');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [peekAnnouncement, setPeekAnnouncement] = useState<Announcement | null>(null);
  const [collapsedRoutineCount, setCollapsedRoutineCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isBackgroundFetching, setIsBackgroundFetching] = useState<boolean>(false);

  // SEBI regulatory RSS feed states
  const [sebiItems, setSebiItems] = useState<SebiRssItem[]>([]);
  const [sebiCategory, setSebiCategory] = useState<string>('ALL');
  const [isSebiLoading, setIsSebiLoading] = useState<boolean>(false);

  // Time window options
  const windowOptions = [
    { label: '24 Hours', hours: 24 },
    { label: '3 Days', hours: 72 },
    { label: '7 Days', hours: 168 },
    { label: '30 Days', hours: 720 },
  ];

  // Category filter options for Portfolio Filings
  const categoryFilters: Array<{ id: AnnouncementCategory | 'ALL'; label: string }> = [
    { id: 'ALL', label: 'All Feeds' },
    { id: 'results', label: 'Quarterly Results' },
    { id: 'unusual_activity', label: 'Market Anomalies' },
    { id: 'management_change', label: 'Mgmt Changes' },
    { id: 'M&A', label: 'M&A & Restructuring' },
    { id: 'capex', label: 'Capex' },
    { id: 'pledging', label: 'Pledging' },
  ];

  // Category filter options for SEBI RSS
  const sebiCategoryFilters = [
    { id: 'ALL', label: 'All Orders' },
    { id: 'Adjudication Order', label: 'Adjudication Orders' },
    { id: 'Recovery Proceedings', label: 'Recovery & Attachment' },
    { id: 'Forensic Action', label: 'Forensic Actions' },
    { id: 'Circular', label: 'Circulars & Directives' },
  ];

  // SWR for Portfolio announcements
  useEffect(() => {
    const cacheKey = `${windowHours}_${onlyMaterial}_${selectedCategory}`;
    const cached = PUSH_FEED_CACHE[cacheKey];

    if (cached) {
      setAnnouncements(cached.data);
      setCollapsedRoutineCount(cached.collapsedRoutineCount);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    let isCancelled = false;
    async function revalidate() {
      setIsBackgroundFetching(true);
      try {
        const params = new URLSearchParams({
          windowHours: windowHours.toString(),
          onlyMaterial: onlyMaterial.toString(),
        });

        if (selectedCategory !== 'ALL') {
          params.append('category', selectedCategory);
        }

        const res = await fetch(`/api/announcements?${params.toString()}`);
        const json = await res.json();
        if (!isCancelled && json.success) {
          const newDataStr = JSON.stringify(json.data);
          const oldDataStr = cached ? JSON.stringify(cached.data) : '';

          if (newDataStr !== oldDataStr || !cached) {
            setAnnouncements(json.data);
            setCollapsedRoutineCount(json.collapsedRoutineCount || 0);
          }

          PUSH_FEED_CACHE[cacheKey] = {
            data: json.data,
            collapsedRoutineCount: json.collapsedRoutineCount || 0,
            timestamp: Date.now(),
          };
        }
      } catch (err) {
        console.warn('Background revalidation failed:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
          setIsBackgroundFetching(false);
          setIsRefreshing(false);
        }
      }
    }

    revalidate();

    return () => {
      isCancelled = true;
    };
  }, [windowHours, onlyMaterial, selectedCategory]);

  // Fetch SEBI RSS when switching to regulatory tab
  useEffect(() => {
    if (feedMode !== 'sebi_rss') return;

    let isCancelled = false;
    async function loadSebiRss() {
      if (sebiItems.length === 0) {
        setIsSebiLoading(true);
      }
      try {
        const params = new URLSearchParams();
        if (sebiCategory !== 'ALL') {
          params.append('category', sebiCategory);
        }
        const res = await fetch(`/api/regulatory-rss?${params.toString()}`);
        const json = await res.json();
        if (!isCancelled && json.success && Array.isArray(json.data)) {
          setSebiItems(json.data);
        }
      } catch (err) {
        console.warn('Failed to load SEBI regulatory RSS:', err);
      } finally {
        if (!isCancelled) {
          setIsSebiLoading(false);
        }
      }
    }

    loadSebiRss();

    return () => {
      isCancelled = true;
    };
  }, [feedMode, sebiCategory]);

  // Explicit user manual refresh
  async function handleManualRefresh() {
    sound.playClick();
    setIsRefreshing(true);

    if (feedMode === 'sebi_rss') {
      try {
        const params = new URLSearchParams();
        if (sebiCategory !== 'ALL') {
          params.append('category', sebiCategory);
        }
        const res = await fetch(`/api/regulatory-rss?${params.toString()}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSebiItems(json.data);
          sound.playChime();
        }
      } catch (err) {
        console.error('SEBI refresh failed:', err);
      } finally {
        setIsRefreshing(false);
      }
      return;
    }

    const cacheKey = `${windowHours}_${onlyMaterial}_${selectedCategory}`;
    try {
      const params = new URLSearchParams({
        windowHours: windowHours.toString(),
        onlyMaterial: onlyMaterial.toString(),
      });

      if (selectedCategory !== 'ALL') {
        params.append('category', selectedCategory);
      }

      const res = await fetch(`/api/announcements?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        PUSH_FEED_CACHE[cacheKey] = {
          data: json.data,
          collapsedRoutineCount: json.collapsedRoutineCount || 0,
          timestamp: Date.now(),
        };
        setAnnouncements(json.data);
        setCollapsedRoutineCount(json.collapsedRoutineCount || 0);
        sound.playChime();
      }
    } catch (err) {
      console.error('Manual refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  }

  // Filtered portfolio announcements (respecting Watchlist toggle)
  const displayedAnnouncements = isWatchlistOnly
    ? announcements.filter((a) => isWatchlisted(a.ticker))
    : announcements;

  return (
    <div className="space-y-3 pb-20">
      {/* COMPARTMENT 1: Rock-Solid Segmented Feed Mode Switcher (Zero Height Shift) */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-neutral-900 border border-neutral-800">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setFeedMode('portfolio');
          }}
          className={`h-9 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap transition-all box-border border ${
            feedMode === 'portfolio'
              ? 'bg-neutral-800 text-white shadow-sm border-neutral-700 font-bold'
              : 'text-neutral-400 hover:text-neutral-200 border-transparent font-medium'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Portfolio</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 shrink-0">
            {displayedAnnouncements.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setFeedMode('sebi_rss');
          }}
          className={`h-9 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap transition-all box-border border ${
            feedMode === 'sebi_rss'
              ? 'bg-neutral-800 text-white shadow-sm border-neutral-700 font-bold'
              : 'text-neutral-400 hover:text-neutral-200 border-transparent font-medium'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />
          <span>SEBI Radar</span>
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0">
            LIVE
          </span>
        </button>
      </div>

      {/* VIEW A: PORTFOLIO FILINGS */}
      {feedMode === 'portfolio' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* COMPARTMENT 2: Unified Horizontal Scope Tray (Time + Filters + Categories) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5 w-full">
            {/* Time Window Tabs */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 shrink-0">
              {windowOptions.map((opt) => (
                <button
                  key={opt.hours}
                  onClick={() => {
                    sound.playClick();
                    setWindowHours(opt.hours);
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-mono whitespace-nowrap transition-all ${
                    windowHours === opt.hours
                      ? 'bg-neutral-800 text-white font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {opt.hours === 24
                    ? '24h'
                    : opt.hours === 72
                    ? '3d'
                    : opt.hours === 168
                    ? '7d'
                    : '30d'}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-neutral-800 shrink-0" />

            {/* Watchlist Toggle Pill */}
            <button
              onClick={() => {
                sound.playClick();
                setIsWatchlistOnly(!isWatchlistOnly);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-mono whitespace-nowrap shrink-0 transition-all ${
                isWatchlistOnly
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold shadow-sm'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
              title="Filter to watchlisted stocks only"
            >
              <Star
                className={`w-3 h-3 ${
                  isWatchlistOnly ? 'fill-amber-400 text-amber-400' : 'text-neutral-400'
                }`}
              />
              <span>Watchlist ({watchlistCount})</span>
            </button>

            {/* Materiality Toggle Pill */}
            <button
              onClick={() => {
                sound.playClick();
                setOnlyMaterial(!onlyMaterial);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-mono whitespace-nowrap shrink-0 transition-all ${
                onlyMaterial
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
              title={onlyMaterial ? 'Showing Material Only' : 'Showing All Filings'}
            >
              <Filter className="w-3 h-3" />
              <span>{onlyMaterial ? 'Material Only' : 'Include Routine'}</span>
            </button>

            <div className="h-4 w-px bg-neutral-800 shrink-0" />

            {/* Category Filter Pills */}
            {categoryFilters.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-neutral-800 border-neutral-700 text-white font-semibold'
                    : 'bg-neutral-900/60 border-neutral-850 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}

            {/* Alert Trigger Settings Modal */}
            {onOpenAlertSettings && (
              <button
                onClick={onOpenAlertSettings}
                className="text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-1.5 rounded-lg transition-colors shrink-0"
                title="Alert Trigger Thresholds"
              >
                <SlidersHorizontal className="w-3 h-3 text-neutral-400" />
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-1.5 rounded-lg transition-colors shrink-0 disabled:opacity-60"
              title="Refresh Feed"
            >
              <RefreshCw
                className={`w-3 h-3 text-emerald-400 ${
                  isRefreshing || isBackgroundFetching ? 'animate-spin' : ''
                }`}
              />
            </button>
          </div>

          {/* COMPARTMENT 3: Low-profile Contextual Status & Actions */}
          <div className="flex items-center justify-between px-1 text-[11px] font-mono text-neutral-400">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span>
                {isWatchlistOnly ? 'Watchlist' : 'Portfolio'} • {displayedAnnouncements.length} disclosures
              </span>
              {onlyMaterial && collapsedRoutineCount > 0 && (
                <button
                  onClick={() => setOnlyMaterial(false)}
                  className="text-neutral-500 hover:text-emerald-400 transition-colors ml-0.5"
                  title="Click to include routine filings"
                >
                  ({collapsedRoutineCount} routine collapsed)
                </button>
              )}
            </div>

            {onClearUrgent && (
              <button
                onClick={() => {
                  sound.playSuccess();
                  onClearUrgent();
                }}
                className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 transition-colors shrink-0"
                title="Mark all urgent alerts as reviewed"
              >
                <span>✓ Clear Badge</span>
              </button>
            )}
          </div>

          {/* Announcements List */}
          {isLoading ? (
            <div className="space-y-3 py-8 text-center text-neutral-500 text-xs font-mono">
              <div className="inline-block w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-2"></div>
              <p>Processing exchange filings and price movements...</p>
            </div>
          ) : displayedAnnouncements.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-neutral-900/40 border border-neutral-850">
              <Layers className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <h4 className="text-white text-sm font-semibold mb-1">
                {isWatchlistOnly ? 'No announcements for watchlisted companies' : 'No announcements in this window'}
              </h4>
              <p className="text-neutral-400 text-xs max-w-xs mx-auto">
                {isWatchlistOnly
                  ? 'Try unchecking Watchlist Only or pin more portfolio stocks using the ★ button.'
                  : 'Try expanding your window to 7 Days or 30 Days, or switch off the Material Only filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedAnnouncements.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: Math.min(idx * 0.04, 0.4) }}
                >
                  <AnnouncementCard
                    announcement={item}
                    onSelectTicker={onSelectTicker}
                    onQuickPeek={(ann) => setPeekAnnouncement(ann)}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Collapsed Routine Filings Counter Tray */}
          <AnimatePresence>
            {onlyMaterial && collapsedRoutineCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border border-neutral-850 bg-neutral-900/50 p-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
                    <strong>{collapsedRoutineCount}</strong> routine filings collapsed (ESOPs, Reg 74(5), duplicate certificates)
                  </span>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setOnlyMaterial(false);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-mono font-medium flex items-center gap-1 transition-colors"
                  >
                    <span>View All</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* VIEW B: LIVE SEBI REGULATORY RADAR (PUBLIC RSS) */}
      {feedMode === 'sebi_rss' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* COMPARTMENT 2: SEBI Category Scope Strip (Smooth Horizontal Scroll Tray) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5 w-full">
            {sebiCategoryFilters.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playClick();
                  setSebiCategory(cat.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border shrink-0 ${
                  sebiCategory === cat.id
                    ? 'bg-neutral-800 border-neutral-700 text-white font-semibold'
                    : 'bg-neutral-900/60 border-neutral-850 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}

            <a
              href="https://www.sebi.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 transition-colors whitespace-nowrap"
            >
              <span>sebi.gov.in RSS</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-1.5 rounded-lg transition-colors shrink-0 disabled:opacity-60"
              title="Refresh SEBI Feed"
            >
              <RefreshCw
                className={`w-3 h-3 text-emerald-400 ${
                  isRefreshing || isBackgroundFetching ? 'animate-spin' : ''
                }`}
              />
            </button>
          </div>

          {/* COMPARTMENT 3: Low-profile Contextual Status Line */}
          <div className="flex items-center justify-between px-1 text-[11px] font-mono text-neutral-400">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse shrink-0"></span>
              <span>Official SEBI Statutory Enforcement Stream ({sebiItems.length} orders loaded)</span>
            </div>
            <span className="text-[10px] text-neutral-500 hidden sm:inline">Real-time Public Feed</span>
          </div>

          {/* SEBI RSS Item Cards */}
          {isSebiLoading ? (
            <div className="space-y-3 py-10 text-center text-neutral-500 text-xs font-mono">
              <div className="inline-block w-6 h-6 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin mb-2"></div>
              <p>Fetching real-time RSS stream from Securities and Exchange Board of India...</p>
            </div>
          ) : sebiItems.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-neutral-900/40 border border-neutral-850">
              <ShieldAlert className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <h4 className="text-white text-sm font-semibold mb-1">No regulatory orders found in this category</h4>
              <p className="text-neutral-400 text-xs max-w-xs mx-auto">
                Select &ldquo;All Orders&rdquo; to view the complete public enforcement feed from SEBI.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sebiItems.map((item, idx) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                  className="rounded-xl border border-neutral-800 bg-neutral-925/80 p-4 space-y-2.5 hover:border-neutral-700 transition-all"
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-850 text-emerald-400 border border-neutral-750">
                        SEBI STATUTORY
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                          item.category === 'Adjudication Order'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : item.category === 'Recovery Proceedings'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : item.category === 'Forensic Action'
                            ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                            : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                        }`}
                      >
                        {item.category}
                      </span>
                      {item.severity === 'high' && (
                        <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          Forensic Action
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400">{item.pubDate}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-white text-sm sm:text-base font-semibold leading-snug">
                    {item.title}
                  </h3>

                  {/* Description */}
                  {item.description && item.description !== item.title && (
                    <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                      {item.description}
                    </p>
                  )}

                  {/* Footer with Direct Official Document Link */}
                  <div className="pt-2 border-t border-neutral-850 flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-[10px] text-neutral-500 truncate max-w-[220px] sm:max-w-none">
                      Securities and Exchange Board of India (SEBI Act, 1992)
                    </span>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-850 hover:bg-neutral-800 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors text-xs shrink-0"
                    >
                      <span>Open SEBI Order / PDF</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Peek Inspection Bottom Sheet (Spacebar / 1-Tap) */}
      <QuickPeekModal
        announcement={peekAnnouncement}
        isOpen={Boolean(peekAnnouncement)}
        onClose={() => setPeekAnnouncement(null)}
        onSelectTicker={onSelectTicker}
        onNavigateAudit={onNavigateAudit}
      />
    </div>
  );
}
