'use client';

import React from 'react';
import { Zap, BookOpen, Scale, Sparkles } from 'lucide-react';

export type NavTab = 'push' | 'pull' | 'narrative' | 'copilot';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  urgentCount?: number;
}

export function BottomNav({ activeTab, onChangeTab, urgentCount = 0 }: BottomNavProps) {
  const tabs = [
    {
      id: 'push' as NavTab,
      label: 'Push Stream',
      sublabel: 'Alerts & Digest',
      icon: Zap,
      badge: urgentCount > 0 ? urgentCount : undefined,
    },
    {
      id: 'pull' as NavTab,
      label: 'Pull Diligence',
      sublabel: '8 Primary Modules',
      icon: BookOpen,
    },
    {
      id: 'narrative' as NavTab,
      label: 'Narrative vs #',
      sublabel: 'Guidance Audit',
      icon: Scale,
    },
    {
      id: 'copilot' as NavTab,
      label: 'FINN Copilot',
      sublabel: 'Primary AI Agent',
      icon: Sparkles,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-850 px-2 py-1.5 safe-area-pb">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-400 bg-neutral-900/80 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] rounded-full bg-emerald-500 text-neutral-950 text-[9px] font-bold flex items-center justify-center font-mono">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] sm:text-xs tracking-tight mt-1 truncate max-w-full font-sans">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
