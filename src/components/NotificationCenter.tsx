'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  UserCheck,
  Building,
  Sliders,
  ExternalLink,
  X,
  Volume2,
} from 'lucide-react';
import { sound } from '@/lib/sound';

export interface AlertNotification {
  id: string;
  ticker: string;
  symbol: string;
  companyName: string;
  title: string;
  detail: string;
  timestamp: string;
  category: 'anomaly' | 'results' | 'mgmt_change' | 'capex' | 'regulatory';
  tier: 'urgent' | 'material';
  isRead: boolean;
  metric?: string;
}

const INITIAL_NOTIFICATIONS: AlertNotification[] = [
  {
    id: 'notif-1',
    ticker: 'KAYNES.NS',
    symbol: 'KAYNES',
    companyName: 'Kaynes Technology India Ltd',
    title: 'Volume Spike Alert (3.42x 20-DMA)',
    detail: 'Surged +5.8% to ₹4,890 with institutional block buying post-Gujarat OSAT semiconductor clearance.',
    timestamp: '2h ago',
    category: 'anomaly',
    tier: 'urgent',
    isRead: false,
    metric: '3.42x Volume',
  },
  {
    id: 'notif-2',
    ticker: 'TRENT.NS',
    symbol: 'TRENT',
    companyName: 'Trent Ltd',
    title: 'Q2 FY25 Audited Results Outperformed',
    detail: 'Consolidated revenue ₹4,157 Cr (+39.4% YoY) led by 43 net new Zudio stores; EBITDA margin 16.4%.',
    timestamp: '3h ago',
    category: 'results',
    tier: 'urgent',
    isRead: false,
    metric: '+39.4% YoY',
  },
  {
    id: 'notif-3',
    ticker: 'DIXON.NS',
    symbol: 'DIXON',
    companyName: 'Dixon Technologies (India) Ltd',
    title: 'New CFO Appointment (Key KMP)',
    detail: 'Ramesh Krishnamurthy (ex-Havells VP Finance) appointed CFO; brings 24+ yrs supply-chain treasury expertise.',
    timestamp: '5h ago',
    category: 'mgmt_change',
    tier: 'urgent',
    isRead: false,
    metric: 'Incoming CFO',
  },
  {
    id: 'notif-4',
    ticker: 'POLYCAB.NS',
    symbol: 'POLYCAB',
    companyName: 'Polycab India Ltd',
    title: '₹1,100 Cr Green-Field Capex Approval',
    detail: 'Board approved high-voltage 550kV EHV power cable manufacturing unit at Halol, Gujarat.',
    timestamp: '11h ago',
    category: 'capex',
    tier: 'material',
    isRead: true,
    metric: '₹1,100 Cr Capex',
  },
  {
    id: 'notif-5',
    ticker: 'ASTRAL.NS',
    symbol: 'ASTRAL',
    companyName: 'Astral Ltd',
    title: 'Promoter Pledging Reduced to 0.0%',
    detail: 'Promoter releases 450,000 pledged shares (0.17%); total promoter equity encumbrance drops to zero.',
    timestamp: '1d ago',
    category: 'regulatory',
    tier: 'urgent',
    isRead: true,
    metric: 'Zero Pledge',
  },
  {
    id: 'notif-6',
    ticker: 'SUNPHARMA.NS',
    symbol: 'SUNPHARMA',
    companyName: 'Sun Pharmaceutical Industries Ltd',
    title: 'US FDA Mohali Plant Cleared (VAI)',
    detail: 'US FDA regulatory inspection closed with Voluntary Action Indicated status, clearing path for ANDA approvals.',
    timestamp: '2d ago',
    category: 'regulatory',
    tier: 'urgent',
    isRead: true,
    metric: 'US FDA VAI',
  },
];

interface NotificationCenterProps {
  onSelectTicker: (ticker: string) => void;
  onOpenAlertSettings: () => void;
}

export function NotificationCenter({
  onSelectTicker,
  onOpenAlertSettings,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AlertNotification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'anomaly'>('all');

  // Load live alerts from /api/announcements
  useEffect(() => {
    async function loadLiveAlerts() {
      try {
        const res = await fetch('/api/announcements?windowHours=24&onlyMaterial=true');
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          const liveAlerts: AlertNotification[] = json.data.slice(0, 8).map((a: any) => ({
            id: a.id,
            ticker: a.ticker,
            symbol: a.ticker.replace(/\.(NS|BO)$/, ''),
            companyName: a.companyName,
            title: a.headline,
            detail: a.oneLineTakeaway,
            timestamp: a.publishedAt,
            category: a.anomaly ? 'anomaly' : a.category === 'results' ? 'results' : a.category === 'management_change' ? 'mgmt_change' : a.category === 'capex' ? 'capex' : 'regulatory',
            tier: a.tier === 'tier1_urgent' ? 'urgent' : 'material',
            isRead: false,
            metric: a.anomaly ? `${a.anomaly.volumeSpikeRatio}x Vol` : a.results ? `${a.results.revenueYoY >= 0 ? '+' : ''}${a.results.revenueYoY}% YoY` : undefined,
          }));

          setNotifications((prev) => {
            const existingIds = new Set(liveAlerts.map((l) => l.id));
            const remaining = prev.filter((p) => !existingIds.has(p.id));
            return [...liveAlerts, ...remaining];
          });
        }
      } catch (err) {
        console.warn('Failed to load live alerts in NotificationCenter:', err);
      }
    }
    loadLiveAlerts();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'urgent') return n.tier === 'urgent';
    if (filter === 'anomaly') return n.category === 'anomaly';
    return true;
  });

  const markAllRead = () => {
    sound.playClick();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markOneRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button with Pulsing Radar Ring */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          sound.playClick();
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-all relative flex items-center justify-center"
        title="Live Alert Radar"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] font-bold text-neutral-950 font-mono items-center justify-center">
                {unreadCount}
              </span>
            </span>
          </>
        )}
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for click-away */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-neutral-950/95 backdrop-blur-xl border border-neutral-800 shadow-2xl z-50 overflow-hidden font-sans"
            >
              {/* Header */}
              <div className="p-3.5 border-b border-neutral-850 flex items-center justify-between bg-neutral-900/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="font-semibold text-white text-xs tracking-tight">
                    Live Alert Radar
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                    {unreadCount} Unread
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-neutral-400 hover:text-emerald-400 transition-colors font-mono"
                    title="Mark all as read"
                  >
                    Mark read
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenAlertSettings();
                    }}
                    className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                    title="Configure Alert Thresholds"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-2 bg-neutral-900/30 border-b border-neutral-850 text-[10px] font-mono">
                {[
                  { id: 'all', label: 'All (6)' },
                  { id: 'urgent', label: 'Urgent (5)' },
                  { id: 'anomaly', label: 'Spikes (1)' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFilter(t.id as any)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      filter === t.id
                        ? 'bg-neutral-800 text-emerald-400 font-bold'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-neutral-900 no-scrollbar">
                {filteredNotifs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-500 font-mono">
                    No active alerts matching filter.
                  </div>
                ) : (
                  filteredNotifs.map((n) => (
                    <motion.div
                      key={n.id}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                      className={`p-3 transition-colors ${
                        !n.isRead ? 'bg-emerald-950/10' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-xs text-white">
                            {n.symbol}
                          </span>
                          {n.metric && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              {n.metric}
                            </span>
                          )}
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {n.timestamp}
                          </span>
                        </div>
                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1"></span>
                        )}
                      </div>

                      <div className="text-xs font-semibold text-neutral-200 mt-1">
                        {n.title}
                      </div>

                      <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                        {n.detail}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-neutral-900/60">
                        <span className="text-[10px] font-mono text-neutral-500 truncate max-w-[150px]">
                          {n.companyName}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              markOneRead(n.id);
                              sound.playClick();
                              setIsOpen(false);
                              onSelectTicker(n.ticker);
                            }}
                            className="text-[10px] font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20"
                          >
                            <span>Diligence</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 bg-neutral-900/60 border-t border-neutral-850 text-center">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAlertSettings();
                  }}
                  className="text-[10px] font-mono text-neutral-400 hover:text-emerald-400 transition-colors flex items-center justify-center gap-1.5 w-full"
                >
                  <Sliders className="w-3 h-3 text-emerald-400" />
                  <span>Configure Volume & Price Swing Triggers</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
