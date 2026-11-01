'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { BottomNav, NavTab } from '@/components/BottomNav';
import { PushFeed } from '@/components/PushFeed';
import { PullDiligence } from '@/components/PullDiligence';
import { NarrativeVsNumbers } from '@/components/NarrativeVsNumbers';
import { CopilotDrawer } from '@/components/CopilotDrawer';
import { SearchModal } from '@/components/SearchModal';
import { AlertSettingsModal } from '@/components/AlertSettingsModal';
import { StockQuote, DiligenceModule, AlertConfig } from '@/lib/types';
import { PRIMARY_DILIGENCE_STORE } from '@/data/diligence';

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>('push');
  const [activeTicker, setActiveTicker] = useState<string>('TRENT.NS');
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [diligence, setDiligence] = useState<DiligenceModule | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);

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
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-4 sm:py-6">
        {activeTab === 'push' && (
          <PushFeed
            onSelectTicker={(ticker) => {
              handleSelectTicker(ticker);
              setActiveTab('pull');
            }}
            onOpenAlertSettings={() => setIsAlertsOpen(true)}
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

        {activeTab === 'copilot' && (
          <CopilotDrawer
            quote={currentQuote}
            onSelectTicker={handleSelectTicker}
          />
        )}
      </main>

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        urgentCount={2}
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
    </div>
  );
}
