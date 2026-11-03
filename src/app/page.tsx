'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav, NavTab } from '@/components/BottomNav';
import { PushFeed } from '@/components/PushFeed';
import { PullDiligence } from '@/components/PullDiligence';
import { NarrativeVsNumbers } from '@/components/NarrativeVsNumbers';
import { CopilotDrawer } from '@/components/CopilotDrawer';
import { SearchModal } from '@/components/SearchModal';
import { AlertSettingsModal } from '@/components/AlertSettingsModal';
import { PortfolioConstellation3D } from '@/components/PortfolioConstellation3D';
import { NotificationToast } from '@/components/NotificationToast';
import { OnboardingTutorial } from '@/components/OnboardingTutorial';
import { AppearanceModal } from '@/components/AppearanceModal';
import { MorningBriefingPill } from '@/components/MorningBriefingPill';
import { StockQuote, DiligenceModule, AlertConfig } from '@/lib/types';
import { PRIMARY_DILIGENCE_STORE } from '@/data/diligence';
import { PORTFOLIO_COMPANIES } from '@/data/portfolio';
import { AlertTriangle, CornerDownLeft, Search } from 'lucide-react';
import { sound } from '@/lib/sound';

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>('push');
  const [activeTicker, setActiveTicker] = useState<string>('TRENT.NS');
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [diligence, setDiligence] = useState<DiligenceModule | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState<boolean>(false);

  // Auto-launch tutorial for first-time visitors
  useEffect(() => {
    try {
      const seen = localStorage.getItem('finn_tutorial_seen');
      if (seen !== 'true') {
        const timer = setTimeout(() => {
          setIsTutorialOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore localStorage sandbox restrictions
    }
  }, []);

  // Dynamic Urgent Alerts Badge & Status
  const [urgentCount, setUrgentCount] = useState<number>(0);
  const [hasAcknowledgedPush, setHasAcknowledgedPush] = useState<boolean>(false);

  // Poll announcements for live urgent count
  useEffect(() => {
    async function checkUrgentCount() {
      try {
        const res = await fetch('/api/announcements?windowHours=24&onlyMaterial=true');
        const json = await res.json();
        if (json.success && typeof json.urgentCount === 'number') {
          if (!hasAcknowledgedPush) {
            setUrgentCount(json.urgentCount);
          }
        }
      } catch (err) {
        console.warn('Failed to load urgent count:', err);
      }
    }

    checkUrgentCount();
  }, [hasAcknowledgedPush]);

  function handleTabChange(tab: NavTab) {
    if (typeof window !== 'undefined' && window.scrollY > 40) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setActiveTab(tab);
    if (tab === 'push') {
      setUrgentCount(0);
      setHasAcknowledgedPush(true);
    }
  }

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);

  // Global Keyboard Shortcuts (Cmd+K, 1-5)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        sound.playClick();
        setIsSearchOpen(true);
        return;
      }

      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === '1') {
          sound.playClick();
          handleTabChange('push');
        } else if (e.key === '2') {
          sound.playClick();
          handleTabChange('pull');
        } else if (e.key === '3') {
          sound.playClick();
          handleTabChange('narrative');
        } else if (e.key === '4') {
          sound.playClick();
          handleTabChange('constellation');
        } else if (e.key === '5') {
          sound.playClick();
          handleTabChange('copilot');
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // User Alert Configuration
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    volumeMultiplierThreshold: 2.0,
    priceMoveThresholdPercent: 3.0,
    onlyMaterial: true,
    monitoredCategories: ['results', 'management_change', 'M&A', 'capex', 'pledging', 'litigation'],
  });

  const [invalidTickerState, setInvalidTickerState] = useState<{
    symbol: string;
    requestedTicker: string;
    didYouMean?: { ticker: string; symbol: string; name: string; sector: string };
    error: string;
  } | null>(null);

  // Fetch company research and live quote whenever activeTicker changes
  useEffect(() => {
    async function loadCompanyData() {
      setIsLoading(true);
      setInvalidTickerState(null);
      try {
        const res = await fetch(`/api/research?ticker=${encodeURIComponent(activeTicker)}`);
        const json = await res.json();
        if (json.success) {
          setQuote(json.quote);
          setDiligence(json.diligence);
          setInvalidTickerState(null);
        } else if (json.isInvalidTicker) {
          setInvalidTickerState({
            symbol: json.symbol || activeTicker.replace(/\.(NS|BO)$/, ''),
            requestedTicker: json.requestedTicker || activeTicker,
            didYouMean: json.didYouMean,
            error: json.error || `Symbol ${activeTicker} was not found on NSE.`,
          });
        } else {
          const fallbackDiligence = PRIMARY_DILIGENCE_STORE[activeTicker];
          if (fallbackDiligence) {
            setDiligence(fallbackDiligence);
          }
        }
      } catch (err) {
        console.error('Failed to load company data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCompanyData();
  }, [activeTicker]);

  // Handler for selecting a ticker from search or cards
  function handleSelectTicker(newTicker: string) {
    setActiveTicker(newTicker);
  }

  // Dynamic quote fallback while in flight matching activeTicker
  const activeMeta = PORTFOLIO_COMPANIES.find(
    (c) => c.ticker === activeTicker || c.symbol === activeTicker.replace(/\.(NS|BO)$/, '')
  );

  const currentQuote: StockQuote = quote || {
    ticker: activeTicker,
    symbol: activeTicker.replace(/\.(NS|BO)$/, ''),
    name: activeMeta?.name || activeTicker.replace(/\.(NS|BO)$/, ''),
    sector: activeMeta?.sector || 'Diversified Indian Equities',
    marketCapCategory: activeMeta?.marketCapCategory || 'Large Cap',
    price: activeMeta?.basePrice || 1000.0,
    change: 0.0,
    changePercent: 0.0,
    volume: 500000,
    avgVolume10d: 500000,
    volumeRatio: 1.0,
    fiftyTwoWeekHigh: activeMeta ? Number((activeMeta.basePrice * 1.25).toFixed(1)) : 1250.0,
    fiftyTwoWeekLow: activeMeta ? Number((activeMeta.basePrice * 0.75).toFixed(1)) : 750.0,
    marketCapCr: activeMeta?.marketCapCr || 50000,
    peRatio: activeMeta?.peRatio || 30.0,
    isPortfolio: activeMeta?.isPortfolio ?? false,
  };

  const currentDiligence: DiligenceModule =
    diligence || PRIMARY_DILIGENCE_STORE[activeTicker] || PRIMARY_DILIGENCE_STORE['TRENT.NS'];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Executive Header */}
      <Header
        activeTicker={activeTicker}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenAppearance={() => setIsAppearanceOpen(true)}
        onSelectTicker={(ticker) => {
          handleSelectTicker(ticker);
          setActiveTab('pull');
        }}
      />

      {/* Floating Animated Push Anomaly Toast */}
      <NotificationToast
        onSelectTicker={(ticker) => {
          handleSelectTicker(ticker);
          setActiveTab('pull');
        }}
      />

      {/* Main Content Area with Fluid Page Transition Animations */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-4 sm:py-6 pb-24 sm:pb-28">
        {/* Glanceable 1-Second Morning Briefing Delta Banner */}
        <div className="mb-4">
          <MorningBriefingPill
            onSelectTicker={(ticker) => {
              handleSelectTicker(ticker);
              setActiveTab('pull');
            }}
            onOpenPushFeed={() => setActiveTab('push')}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {activeTab === 'push' && (
              <PushFeed
                onSelectTicker={(ticker) => {
                  handleSelectTicker(ticker);
                  setActiveTab('pull');
                }}
                onOpenAlertSettings={() => setIsAlertsOpen(true)}
                onClearUrgent={() => {
                  setUrgentCount(0);
                  setHasAcknowledgedPush(true);
                }}
              />
            )}

            {activeTab === 'pull' && (
              invalidTickerState ? (
                <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-6 text-center max-w-xl mx-auto my-6 animate-in fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-md shadow-amber-950">
                    <AlertTriangle className="w-7 h-7" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-white text-lg sm:text-xl font-bold tracking-tight">
                      Symbol &ldquo;{invalidTickerState.symbol}&rdquo; Not Found on NSE
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md mx-auto">
                      No active listed security matches this symbol. FINN will not generate synthetic estimates for unverified tickers.
                    </p>
                  </div>

                  {invalidTickerState.didYouMean && (
                    <div className="p-4 rounded-xl bg-neutral-850/80 border border-emerald-500/30 text-left space-y-3">
                      <div className="text-[11px] text-emerald-400 font-mono font-medium uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Did you mean this company?
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-base font-bold font-mono text-white">
                            {invalidTickerState.didYouMean.symbol}
                          </div>
                          <div className="text-xs text-neutral-300">
                            {invalidTickerState.didYouMean.name}
                          </div>
                          <div className="text-[11px] text-neutral-500">
                            {invalidTickerState.didYouMean.sector}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            sound.playClick();
                            handleSelectTicker(invalidTickerState.didYouMean!.ticker);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold font-mono text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-md shadow-emerald-950"
                        >
                          <span>Load {invalidTickerState.didYouMean.symbol}</span>
                          <CornerDownLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                    <button
                      onClick={() => setIsSearchOpen(true)}
                      className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-mono flex items-center gap-2 border border-neutral-700 transition-colors"
                    >
                      <Search className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Search 4,500+ Indian Equities (⌘K)</span>
                    </button>
                    <button
                      onClick={() => handleSelectTicker('TRENT.NS')}
                      className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white text-xs font-mono border border-neutral-700 transition-colors"
                    >
                      Return to Trent (TRENT)
                    </button>
                  </div>
                </div>
              ) : (
                <PullDiligence
                  quote={currentQuote}
                  diligence={currentDiligence}
                  onSelectTicker={handleSelectTicker}
                  onOpenSearch={() => setIsSearchOpen(true)}
                />
              )
            )}

            {activeTab === 'narrative' && (
              invalidTickerState ? (
                <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-4 text-center max-w-xl mx-auto my-6">
                  <div className="text-amber-400 font-mono text-sm font-semibold">
                    Audits Unavailable for &ldquo;{invalidTickerState.symbol}&rdquo;
                  </div>
                  <p className="text-xs text-neutral-400">
                    Cannot audit management guidance divergence for unverified security &ldquo;{invalidTickerState.symbol}&rdquo;.
                  </p>
                  {invalidTickerState.didYouMean && (
                    <button
                      onClick={() => handleSelectTicker(invalidTickerState.didYouMean!.ticker)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold font-mono text-xs inline-flex items-center gap-1.5"
                    >
                      Audit {invalidTickerState.didYouMean.symbol} Instead
                    </button>
                  )}
                </div>
              ) : (
                <NarrativeVsNumbers
                  quote={currentQuote}
                  diligence={currentDiligence}
                  onSelectTicker={handleSelectTicker}
                />
              )
            )}

            {activeTab === 'constellation' && (
              <PortfolioConstellation3D
                activeTicker={activeTicker}
                onSelectTicker={(ticker) => {
                  handleSelectTicker(ticker);
                  setActiveTab('pull');
                }}
              />
            )}

            {activeTab === 'copilot' && (
              <CopilotDrawer
                quote={currentQuote}
                onSelectTicker={handleSelectTicker}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        urgentCount={urgentCount}
      />

      {/* Search & Dynamic Generalization Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTicker={(ticker) => {
          handleSelectTicker(ticker);
          if (activeTab === 'push') setActiveTab('pull');
        }}
        currentTicker={activeTicker}
      />

      {/* Configurable Alert Rules Modal */}
      <AlertSettingsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        config={alertConfig}
        onSaveConfig={setAlertConfig}
      />

      {/* Interactive Platform Onboarding Tutorial Modal */}
      <OnboardingTutorial
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onNavigateTab={(tab) => handleTabChange(tab)}
      />

      {/* Appearance & 5-Accent Color Schemes Modal */}
      <AppearanceModal
        isOpen={isAppearanceOpen}
        onClose={() => setIsAppearanceOpen(false)}
        onOpenTutorial={() => {
          setIsAppearanceOpen(false);
          setIsTutorialOpen(true);
        }}
      />
    </div>
  );
}
