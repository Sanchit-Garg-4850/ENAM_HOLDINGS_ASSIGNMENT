'use client';

import React, { useState } from 'react';
import { TrendingUp, BarChart2, Layers } from 'lucide-react';
import { sound } from '@/lib/sound';

interface FinancialPoint {
  period: string;
  revenue: number; // in ₹ Cr
  ebitda: number; // in ₹ Cr
  margin: number; // in %
  pat?: number; // in ₹ Cr
}

interface InteractiveFinancialChartProps {
  data: FinancialPoint[];
  symbol: string;
}

export function InteractiveFinancialChart({ data, symbol }: InteractiveFinancialChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(data.length - 1);

  if (!data || data.length === 0) return null;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const maxMargin = Math.max(...data.map((d) => d.margin), 25);

  const activePoint = hoveredIdx !== null ? data[hoveredIdx] : data[data.length - 1];

  return (
    <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-3">
      {/* Chart Top Metrics Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
            Interactive Financial Trajectory: {symbol}
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg sm:text-xl font-bold font-mono text-white">
              ₹{activePoint.revenue.toLocaleString()} <span className="text-xs text-neutral-400 font-normal">Cr Sales</span>
            </span>
            <span className="text-xs font-mono font-semibold text-emerald-400">
              {activePoint.margin}% EBITDA Margin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/80"></span> Revenue (₹Cr)
          </span>
          <span className="flex items-center gap-1 text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span> Margin %
          </span>
          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
            {activePoint.period}
          </span>
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div className="relative h-44 sm:h-48 w-full pt-4">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="barGradActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="40" x2="500" y2="40" stroke="#262626" strokeDasharray="3 3" />
          <line x1="0" y1="90" x2="500" y2="90" stroke="#262626" strokeDasharray="3 3" />
          <line x1="0" y1="140" x2="500" y2="140" stroke="#333333" />

          {/* Revenue Bars */}
          {data.map((d, i) => {
            const barWidth = Math.min(32, 400 / data.length / 1.5);
            const x = (500 / data.length) * (i + 0.5) - barWidth / 2;
            const barHeight = (d.revenue / maxRevenue) * 110;
            const y = 140 - barHeight;
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={i}
                className="cursor-pointer transition-all"
                onMouseEnter={() => {
                  sound.playClick();
                  setHoveredIdx(i);
                }}
                onClick={() => {
                  sound.playClick();
                  setHoveredIdx(i);
                }}
              >
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  fill={isHovered ? 'url(#barGradActive)' : 'url(#barGrad)'}
                  stroke={isHovered ? '#6ee7b7' : 'none'}
                  strokeWidth={isHovered ? '1.5' : '0'}
                  className="transition-all duration-150"
                />
                {/* Period label under bar */}
                <text
                  x={x + barWidth / 2}
                  y="155"
                  fill={isHovered ? '#ffffff' : '#a3a3a3'}
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                >
                  {d.period.split(' ')[0]}
                </text>
              </g>
            );
          })}

          {/* Margin Line Overlay */}
          {data.length > 1 && (
            <polyline
              fill="none"
              stroke="#818cf8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={data
                .map((d, i) => {
                  const x = (500 / data.length) * (i + 0.5);
                  const y = 140 - (d.margin / (maxMargin * 1.2)) * 120;
                  return `${x},${y}`;
                })
                .join(' ')}
            />
          )}

          {/* Margin Glowing Points */}
          {data.map((d, i) => {
            const x = (500 / data.length) * (i + 0.5);
            const y = 140 - (d.margin / (maxMargin * 1.2)) * 120;
            const isHovered = hoveredIdx === i;

            return (
              <g key={`pt-${i}`}>
                {isHovered && <circle cx={x} cy={y} r="6" fill="rgba(129, 140, 248, 0.4)" />}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? '4' : '2.5'}
                  fill="#818cf8"
                  stroke="#1e1b4b"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Scrubbed Details Drawer Card */}
      {activePoint && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-neutral-850/80 text-xs font-mono">
          <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block">Sales Revenue</span>
            <span className="font-bold text-white">₹{activePoint.revenue.toLocaleString()} Cr</span>
          </div>
          <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block">Operating EBITDA</span>
            <span className="font-bold text-emerald-400">₹{activePoint.ebitda.toLocaleString()} Cr</span>
          </div>
          <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block">EBITDA Margin</span>
            <span className="font-bold text-indigo-400">{activePoint.margin}%</span>
          </div>
          <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block">Net PAT</span>
            <span className="font-bold text-white">
              {activePoint.pat ? `₹${activePoint.pat.toLocaleString()} Cr` : 'N/A'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
