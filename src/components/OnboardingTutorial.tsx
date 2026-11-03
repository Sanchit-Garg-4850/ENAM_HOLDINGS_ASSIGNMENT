'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Zap,
  BookOpen,
  Scale,
  Orbit,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  SlidersHorizontal,
  FileCheck,
  Search,
  Command,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: 'push' | 'pull' | 'narrative' | 'constellation' | 'copilot') => void;
}

interface TutorialStep {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  icon: any;
  iconColor: string;
  points: Array<{ title: string; desc: string }>;
  tip: string;
  targetTab?: 'push' | 'pull' | 'narrative' | 'constellation' | 'copilot';
}

const STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    badge: 'ENAM Holdings Mandate',
    title: 'Welcome to FINN (Financial Investment Agent)',
    subtitle: 'High-conviction public markets intelligence layer. Filter signal from noise.',
    icon: Sparkles,
    iconColor: 'text-emerald-400',
    points: [
      {
        title: 'Two Core Modes of Interaction',
        desc: 'Push proactively alerts you to market anomalies and material filings; Pull lets you interrogate any company on demand.',
      },
      {
        title: '100% Primary Grounding Discipline',
        desc: 'Strictly Annual Reports, Concall Transcripts, and Audited Exchange Filings. No broker gossip, secondary noise, or hallucinations.',
      },
      {
        title: 'Zero-Cost Architecture ($0.00 Spend)',
        desc: 'Engineered entirely on public endpoints (Yahoo Finance, BSE India, Screener.in) with instant client-side execution.',
      },
    ],
    tip: 'Tip: You can use keyboard shortcuts 1–5 to instantly switch tabs and ⌘K to search any stock.',
  },
  {
    id: 'push',
    badge: 'Proactive Alerting',
    title: 'Push Feed: Windowed Digest & Anomaly Radar',
    subtitle: 'See what matters first across your 18 portfolio companies.',
    icon: Zap,
    iconColor: 'text-amber-400',
    points: [
      {
        title: 'Windowed Digest (24h, 3d, 7d, 30d)',
        desc: 'Choose your monitoring horizon. Routine secretarial filings (ESOPs, compliance certificates) are collapsed by default to preserve attention.',
      },
      {
        title: 'Real-Time Volume & Price Anomaly Triggers',
        desc: 'Automatically flags tickers exceeding >2.0x 10-DMA traded volume or ±3.0% daily price swings.',
      },
      {
        title: 'Enriched Filings',
        desc: 'Quarterly results feature a 4-box headline grid (Revenue, EBITDA, PBT, PAT) with QoQ/YoY margins. Management changes highlight incoming executive pedigree.',
      },
    ],
    tip: 'Tap "Triggers" in the Push banner to customize your volume multiplier and price swing thresholds.',
    targetTab: 'push',
  },
  {
    id: 'pull',
    badge: 'On-Demand Research',
    title: 'Pull Workspace: 8 Deep Diligence Modules',
    subtitle: 'Comprehensive institutional analysis grounded strictly in audited company disclosures.',
    icon: BookOpen,
    iconColor: 'text-blue-400',
    points: [
      {
        title: '8 Structured Modules',
        desc: 'Business Snapshot, Financial Snapshot, Multi-Year Trajectory, Balance Sheet Solvency, Cash Quality, Narrative vs. Numbers, Forward Guidance, and Bull vs. Bear Case.',
      },
      {
        title: 'Cash Flow Quality Sentinel',
        desc: 'Calculates the Cash Conversion Ratio (OCF / PAT) and FCF yield to detect if accounting profits fail to turn into hard cash.',
      },
      {
        title: 'Generalizes to Any NSE Ticker',
        desc: 'Not limited to the demo portfolio. Point FINN at any Indian equity (e.g. HAL, BEL, INFY) for on-demand synthesis.',
      },
    ],
    tip: 'Click any primary citation pill to inspect verbatim extracts from original annual reports and concall transcripts.',
    targetTab: 'pull',
  },
  {
    id: 'narrative',
    badge: 'The Core Showcase',
    title: 'Narrative vs. Numbers: Guidance Audit Ledger',
    subtitle: 'Where management story and actual delivered financials agree or diverge.',
    icon: Scale,
    iconColor: 'text-purple-400',
    points: [
      {
        title: '4-Quarter Systematic Track Record',
        desc: 'Audits every guidance promise made on earnings calls against the subsequent audited financial filing.',
      },
      {
        title: 'Verbatim Concall & Filing Citations',
        desc: 'Direct quotes with speaker attribution and exchange filing dates for complete auditability.',
      },
      {
        title: 'Quantitative Reliability Score',
        desc: 'A 0–100 score rating how faithfully executive management delivers on their stated revenue and margin targets.',
      },
    ],
    tip: 'A high reliability score (>85/100) indicates management with strong execution credibility.',
    targetTab: 'narrative',
  },
  {
    id: 'constellation',
    badge: 'Interactive Universe',
    title: '3D Constellation & Copilot Intelligence',
    subtitle: 'Explore market clusters in real-time 3D and interrogate with AI.',
    icon: Orbit,
    iconColor: 'text-cyan-400',
    points: [
      {
        title: '3D Orbital Universe',
        desc: 'Interactive 3D celestial sphere mapping portfolio companies into sector clusters with live prices, daily % swings, and inertial touch rotation.',
      },
      {
        title: 'Voice-Enabled Copilot Agent',
        desc: 'Ask complex financial questions via text or voice dictation. Runs on FINN Zero-Cost Primary Engine with optional Gemini/OpenAI generative synthesis.',
      },
      {
        title: 'One-Click Investment Memo Export',
        desc: 'Export your research dialogues into publication-ready Markdown investment memos with a single tap.',
      },
    ],
    tip: 'Press ⌘K at any time to instantly search and load any Indian company into FINN.',
    targetTab: 'constellation',
  },
];

export function OnboardingTutorial({
  isOpen,
  onClose,
  onNavigateTab,
}: OnboardingTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const step = STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === STEPS.length - 1;

  const handleNext = () => {
    sound.playClick();
    if (isLast) {
      handleFinish();
    } else {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      if (STEPS[nextIndex].targetTab && onNavigateTab) {
        onNavigateTab(STEPS[nextIndex].targetTab!);
      }
    }
  };

  const handleBack = () => {
    sound.playClick();
    if (!isFirst) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      if (STEPS[prevIndex].targetTab && onNavigateTab) {
        onNavigateTab(STEPS[prevIndex].targetTab!);
      }
    }
  };

  const handleFinish = () => {
    sound.playSuccess();
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
    });
    localStorage.setItem('finn_tutorial_seen', 'true');
    onClose();
  };

  const Icon = step.icon;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Bar */}
          <div className="px-5 py-3.5 border-b border-neutral-800/80 flex items-center justify-between bg-neutral-950/60">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-semibold">
                {step.badge}
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                Step {currentStepIndex + 1} of {STEPS.length}
              </span>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                handleFinish();
              }}
              className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors"
              title="Close Tutorial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0 shadow-inner">
                <Icon className={`w-5 h-5 ${step.iconColor}`} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">{step.subtitle}</p>
              </div>
            </div>

            {/* Feature Points */}
            <div className="space-y-2.5 pt-1">
              {step.points.map((pt, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-850 hover:border-neutral-800 transition-colors space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-xs font-semibold text-neutral-200">
                      {pt.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 pl-5.5 leading-relaxed">
                    {pt.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Pro Tip Callout */}
            <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[11px] font-mono text-emerald-300/90 flex items-start gap-2">
              <span className="shrink-0 mt-0.5 font-bold">💡</span>
              <span>{step.tip}</span>
            </div>
          </div>

          {/* Footer Controls & Stepper */}
          <div className="px-5 py-3.5 border-t border-neutral-800/80 bg-neutral-950/80 flex items-center justify-between gap-3">
            {/* Step Indicators */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    sound.playClick();
                    setCurrentStepIndex(i);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentStepIndex
                      ? 'w-6 bg-emerald-400'
                      : 'w-1.5 bg-neutral-700 hover:bg-neutral-600'
                  }`}
                  title={`Go to step ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-mono transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs font-mono transition-all shadow-md shadow-emerald-950/40"
              >
                <span>{isLast ? 'Start Exploring FINN' : 'Next'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
