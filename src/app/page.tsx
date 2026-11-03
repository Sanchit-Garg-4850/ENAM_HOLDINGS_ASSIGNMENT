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

  // Fetch company research and live quote whenever activeTicker changes
  useEffect(() => {
    async function loadCompanyData() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/research?ticker=${encodeURIComponent(activeTicker)}`);
        const json = await res.json();
        if (json.success) {
          setQuote(json.quote);
          setDiligence(json.diligence);
        } else {
          // Fallback to local store
          const fallbackDiligence =
            PRIMARY_DILIGENCE_STORE[activeTicker] || PRIMARY_DILIGENCE_STORE['TRENT.NS'];
          setDiligence(fallbackDiligence);
        }
      } catch (err) {
        console.error('Failed to load company data:', err);
        const fallbackDiligence =
          PRIMARY_DILIGENCE_STORE[activeTicker] || PRIMARY_DILIGENCE_STORE['TRENT.NS'];
        setDiligence(fallbackDiligence);
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

  // Fallback quote if still loading
  const currentQuote: StockQuote = quote || {
    ticker: activeTicker,
    symbol: activeTicker.replace(/\.(NS|BO)$/, ''),
    name: activeTicker === 'TRENT.NS' ? 'Trent Ltd' : activeTicker,
    sector: 'Retail & Consumer Discretionary',
    marketCapCategory: 'Large Cap',
    price: 6850.0,
    change: 94.5,
    changePercent: 1.4,
    volume: 840000,
    avgVolume10d: 650000,
    volumeRatio: 1.29,
    fiftyTwoWeekHigh: 7200.0,
    fiftyTwoWeekLow: 3200.0,
    marketCapCr: 243000,
    peRatio: 125.0,
    isPortfolio: true,
  };

  const currentDiligence: DiligenceModule =
    diligence || PRIMARY_DILIGENCE_STORE['TRENT.NS'];

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
              <PullDiligence
                quote={currentQuote}
                diligence={currentDiligence}
                onSelectTicker={handleSelectTicker}
                onOpenSearch={() => setIsSearchOpen(true)}
              />
            )}

            {activeTab === 'narrative' && (
              <NarrativeVsNumbers
                quote={currentQuote}
                diligence={currentDiligence}
                onSelectTicker={handleSelectTicker}
              />
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
