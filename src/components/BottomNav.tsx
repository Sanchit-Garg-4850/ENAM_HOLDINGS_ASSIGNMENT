'use client';

import React from 'react';
import { Zap, BookOpen, Scale, Sparkles, Orbit } from 'lucide-react';
import { sound } from '@/lib/sound';

export type NavTab = 'push' | 'pull' | 'narrative' | 'constellation' | 'copilot';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  urgentCount?: number;
}

export function BottomNav({ activeTab, onChangeTab, urgentCount = 0 }: BottomNavProps) {
  const tabs = [
    {
      id: 'push' as NavTab,
      label: 'Push',
      sublabel: 'Alerts',
      icon: Zap,
      badge: urgentCount > 0 ? urgentCount : undefined,
    },
    {
      id: 'pull' as NavTab,
      label: 'Pull',
      sublabel: '8 Modules',
      icon: BookOpen,
    },
    {
      id: 'narrative' as NavTab,
      label: 'Narrative',
      sublabel: 'Audit',
      icon: Scale,
    },
    {
      id: 'constellation' as NavTab,
      label: '3D Orbit',
      sublabel: 'Universe',
      icon: Orbit,
    },
    {
      id: 'copilot' as NavTab,
      label: 'Copilot',
      sublabel: 'AI Agent',
      icon: Sparkles,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-850 px-2 py-1.5 safe-area-pb">
      <div className="max-w-lg mx-auto grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                onChangeTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all relative ${
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
              <span className="text-[10px] sm:text-xs tracking-tight mt-1 truncate max-w-full font-sans">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
