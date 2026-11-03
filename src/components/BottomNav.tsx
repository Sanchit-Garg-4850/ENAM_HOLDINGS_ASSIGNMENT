'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
      icon: Zap,
      badge: urgentCount > 0 ? urgentCount : undefined,
    },
    {
      id: 'pull' as NavTab,
      label: 'Pull',
      icon: BookOpen,
    },
    {
      id: 'narrative' as NavTab,
      label: 'Audit',
      icon: Scale,
    },
    {
      id: 'constellation' as NavTab,
      label: '3D Orbit',
      icon: Orbit,
    },
    {
      id: 'copilot' as NavTab,
      label: 'Copilot',
      icon: Sparkles,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-850/80 px-2 sm:px-4 py-1.5 safe-area-pb transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                if (typeof window !== 'undefined' && window.scrollY > 40) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                onChangeTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 bg-neutral-900/90 border border-emerald-500/30 rounded-xl shadow-inner shadow-emerald-950/20"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative">
                  <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform ${isActive ? 'stroke-[2.2] scale-110' : 'stroke-[1.8]'}`} />
                  {tab.badge && (
                    <span className="absolute -top-1.5 -right-2.5 px-1 min-w-[14px] h-[14px] rounded-full bg-emerald-500 text-neutral-950 text-[9px] font-bold flex items-center justify-center font-mono">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-1 truncate max-w-full font-medium font-sans">
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
