'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  RotateCcw,
  ArrowRight,
  Eye,
  Star,
  Search,
  Scale,
  TrendingUp,
  TrendingDown,
  Flame,
  ShieldCheck,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { PORTFOLIO_COMPANIES, CompanyMetadata } from '@/data/portfolio';
import { sound } from '@/lib/sound';
import { useTheme } from '@/lib/themeContext';
import { useWatchlist } from '@/lib/useWatchlist';

interface PortfolioConstellation3DProps {
  onSelectTicker: (ticker: string) => void;
  activeTicker: string;
  onNavigateAudit?: (ticker: string) => void;
}

interface Node3D {
  ticker: string;
  symbol: string;
  name: string;
  sector: string;
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  color: string;
  glowColor: string;
  price: number;
  changePercent?: number;
  volumeRatio?: number;
}

// Institutional Investment Mandates & Management Reliability Benchmarks
const HOLDINGS_METADATA: Record<
  string,
  { mandate: string; reliability: number; reliabilityTier: string }
> = {
  'TRENT.NS': {
    mandate: 'Zudio fast-fashion store expansion (200+ stores/yr) & Star Bazaar gross margin inflection',
    reliability: 94,
    reliabilityTier: 'High Conviction',
  },
  'KAYNES.NS': {
    mandate: 'Defense/aerospace EMS backlog execution & Sanand OSAT semiconductor packaging commissioning',
    reliability: 91,
    reliabilityTier: 'High Growth',
  },
  'RELIANCE.NS': {
    mandate: 'Jio 5G monetization, retail omnichannel dominance, and green hydrogen capex rollout',
    reliability: 92,
    reliabilityTier: 'Mega Compounder',
  },
  'HDFCBANK.NS': {
    mandate: 'Post-merger loan-to-deposit ratio (LDR) normalisation and branch deposit mobilization',
    reliability: 90,
    reliabilityTier: 'Quality Franchise',
  },
  'TCS.NS': {
    mandate: 'Tier-1 IT deal bookings, AI & cloud migration pipeline, and 25%+ operating margin defense',
    reliability: 93,
    reliabilityTier: 'Cash Machine',
  },
  'ITC.NS': {
    mandate: 'Hotels business demerger unlock, non-cigarette FMCG scale, and high free cash conversion',
    reliability: 95,
    reliabilityTier: 'Defensive Value',
  },
  'LT.NS': {
    mandate: 'Record ₹5 Lakh Cr+ infrastructure EPC order book delivery across domestic and GCC corridors',
    reliability: 92,
    reliabilityTier: 'Capex Proxy',
  },
  'SUNPHARMA.NS': {
    mandate: 'Global specialty pharma portfolio scale-up (Ilumya, Winlevi) and US generic compliance',
    reliability: 88,
    reliabilityTier: 'Specialty Pharma',
  },
  'MARUTI.NS': {
    mandate: 'SUV segment market share reclamation (>22%), EV production line startup, and hybrid lineup',
    reliability: 90,
    reliabilityTier: 'Market Leader',
  },
  'POLYCAB.NS': {
    mandate: 'Wires & cables domestic infrastructure demand, FMEG turnaround, and international exports',
    reliability: 87,
    reliabilityTier: 'Industrial Moat',
  },
  'DIXON.NS': {
    mandate: 'Smartphone EMS PLI volume ramp-up, Ismartu acquisition integration, and component localization',
    reliability: 89,
    reliabilityTier: 'Manufacturing Scale',
  },
  'FEDERALBNK.NS': {
    mandate: 'Fintech co-lending partnerships, commercial banking expansion, and stable net interest margins (>3.2%)',
    reliability: 86,
    reliabilityTier: 'Mid-Cap Value',
  },
  'PERSISTENT.NS': {
    mandate: 'BFSI & healthcare digital engineering services, generative AI client deployments, and $2B target',
    reliability: 91,
    reliabilityTier: 'Digital Pure-Play',
  },
  'ASTRAL.NS': {
    mandate: 'Plumbing & CPVC piping volume growth, adhesives cross-selling into tier-2/3 dealer networks',
    reliability: 88,
    reliabilityTier: 'Building Materials',
  },
  'ZOMATO.NS': {
    mandate: 'Blinkit quick commerce dark store densification, 10-min grocery GOV surge & adjusted EBITDA breakeven',
    reliability: 87,
    reliabilityTier: 'Hyper-Growth',
  },
  'CDSL.NS': {
    mandate: 'Retail equity demat account opening velocity, transaction annuity revenues, and market financialization proxy',
    reliability: 94,
    reliabilityTier: 'Monopoly Utility',
  },
  'MAPMYINDIA.NS': {
    mandate: 'Automotive OEM navigation embedding (EV & connected dashboards), drone mapping, and enterprise IoT',
    reliability: 86,
    reliabilityTier: 'Deep-Tech Moat',
  },
  'CLEAN.NS': {
    mandate: 'Catalytic green chemistry yield advantages, novel HALS production commercialization, and specialty export demand',
    reliability: 89,
    reliabilityTier: 'Clean Chemistry',
  },
};


const CORE_PORTFOLIO = PORTFOLIO_COMPANIES.filter((c) => c.isPortfolio);

export function PortfolioConstellation3D({


  onSelectTicker,
  activeTicker,
  onNavigateAudit,
}: PortfolioConstellation3DProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { isWatchlisted, toggleWatchlist, watchlistCount } = useWatchlist();

  const [hoveredNode, setHoveredNode] = useState<Node3D | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(0.003);
  const [liveQuotes, setLiveQuotes] = useState<
    Record<string, { price: number; changePercent: number; volumeRatio: number }>
  >({});

  // Holdings Matrix State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [isMatrixWatchlistOnly, setIsMatrixWatchlistOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'mcap' | 'change' | 'volume' | 'reliability'>('mcap');

  // Fetch live quotes from /api/portfolio
  useEffect(() => {
    async function loadLiveQuotes() {
      try {
        const res = await fetch('/api/portfolio');
        const json = await res.json();
        if (json.success && json.data) {
          const map: Record<
            string,
            { price: number; changePercent: number; volumeRatio: number }
          > = {};
          json.data.forEach((q: any) => {
            map[q.ticker] = {
              price: q.price,
              changePercent: q.changePercent,
              volumeRatio: q.volumeRatio,
            };
          });
          setLiveQuotes(map);
        }
      } catch (err) {
        console.warn('Constellation failed to load live quotes:', err);
      }
    }
    loadLiveQuotes();
  }, []);

  // Sector color palette
  const sectorColors: Record<string, { main: string; glow: string }> = {
    'Conglomerates & Energy': { main: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' }, // Amber
    'Financials & Banking': { main: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' }, // Blue
    'Information Technology': { main: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' }, // Purple
    'Consumer Goods (FMCG)': { main: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' }, // Emerald
    'Infrastructure & Engineering': { main: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' }, // Cyan
    'Healthcare & Pharma': { main: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)' }, // Pink
    'Retail & Consumer Discretionary': { main: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' }, // Emerald
    'Industrial Manufacturing': { main: '#eab308', glow: 'rgba(234, 179, 8, 0.4)' }, // Yellow
    'Electronics Manufacturing': { main: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)' }, // Indigo
    'Consumer Tech': { main: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' }, // Red
    'High-Tech Manufacturing': { main: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)' },
    'Specialty Chemicals': { main: '#14b8a6', glow: 'rgba(20, 184, 166, 0.4)' },
    'Deep Tech & SaaS': { main: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' },
    Automotive: { main: '#f97316', glow: 'rgba(249, 115, 22, 0.4)' },
    'Building Materials': { main: '#84cc16', glow: 'rgba(132, 204, 22, 0.4)' },
    'Financial Infrastructure': { main: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)' },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = isFullscreen ? 500 : 320);

    // Generate 3D spherical positions for all companies using Fibonacci Sphere Distribution
    const count = CORE_PORTFOLIO.length;
    const sphereRadius = Math.min(width, height) * 0.38;

    const nodes: Node3D[] = CORE_PORTFOLIO.map((company, i) => {

      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      const colorSet = sectorColors[company.sector] || {
        main: '#10b981',
        glow: 'rgba(16, 185, 129, 0.4)',
      };

      const radius =
        company.marketCapCategory === 'Mega Cap'
          ? 12
          : company.marketCapCategory === 'Large Cap'
          ? 9
          : 7;
      const live = liveQuotes[company.ticker];
      const livePrice = live?.price ?? company.basePrice;
      const liveChange = live?.changePercent;
      const liveVolRatio = live?.volumeRatio;

      return {
        ticker: company.ticker,
        symbol: company.symbol,
        name: company.name,
        sector: company.sector,
        x: sphereRadius * Math.sin(phi) * Math.cos(theta),
        y: sphereRadius * Math.cos(phi),
        z: sphereRadius * Math.sin(phi) * Math.sin(theta),
        baseRadius: radius,
        color: colorSet.main,
        glowColor: colorSet.glow,
        price: livePrice,
        changePercent: liveChange,
        volumeRatio: liveVolRatio,
      };
    });

    // 3D Rotation angles
    let angleX = 0.001;
    let angleY = 0.002;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    function handleMouseDown(e: MouseEvent) {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    }

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();

      if (isDragging) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        angleY = -deltaX * 0.006;
        angleX = deltaY * 0.006;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      } else {
        let found: Node3D | null = null;
        for (const n of nodes) {
          const fov = 350;
          const scale = fov / (fov + n.z);
          const projX = n.x * scale;
          const projY = n.y * scale;
          const screenX = projX + width / 2;
          const screenY = projY + height / 2;

          const mouseCanvasX = e.clientX - rect.left;
          const mouseCanvasY = e.clientY - rect.top;

          const dist = Math.hypot(mouseCanvasX - screenX, mouseCanvasY - screenY);
          if (dist < n.baseRadius * scale + 10) {
            found = n;
            break;
          }
        }
        setHoveredNode(found);
      }
    }

    function handleMouseUp() {
      isDragging = false;
    }

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    function rotateX(node: Node3D, angle: number) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const y = node.y * cos - node.z * sin;
      const z = node.z * cos + node.y * sin;
      node.y = y;
      node.z = z;
    }

    function rotateY(node: Node3D, angle: number) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x = node.x * cos - node.z * sin;
      const z = node.z * cos + node.x * sin;
      node.x = x;
      node.z = z;
    }

    function render() {
      ctx!.clearRect(0, 0, width, height);

      // Auto rotation
      nodes.forEach((n) => {
        rotateY(n, rotationSpeed + angleY * 0.1);
        rotateX(n, angleX * 0.1);
      });

      // Decay manual rotation impulses
      angleX *= 0.94;
      angleY *= 0.94;

      // Draw constellation connections between nodes of the same sector
      ctx!.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[i].sector === nodes[j].sector) {
            const fov = 350;
            const scaleI = fov / (fov + nodes[i].z);
            const scaleJ = fov / (fov + nodes[j].z);

            const xi = nodes[i].x * scaleI + width / 2;
            const yi = nodes[i].y * scaleI + height / 2;
            const xj = nodes[j].x * scaleJ + width / 2;
            const yj = nodes[j].y * scaleJ + height / 2;

            const avgZ = (nodes[i].z + nodes[j].z) / 2;
            const alpha = Math.max(0.04, Math.min(0.28, (avgZ + sphereRadius) / (2 * sphereRadius)));

            ctx!.strokeStyle = `rgba(140, 160, 180, ${alpha})`;
            ctx!.beginPath();
            ctx!.moveTo(xi, yi);
            ctx!.lineTo(xj, yj);
            ctx!.stroke();
          }
        }
      }

      // Sort nodes back-to-front so closer nodes draw on top
      const sorted = [...nodes].sort((a, b) => b.z - a.z);

      // Draw each node
      sorted.forEach((node) => {
        const fov = 350;
        const scale = fov / (fov + node.z);
        const screenX = node.x * scale + width / 2;
        const screenY = node.y * scale + height / 2;

        const isHovered = hoveredNode?.ticker === node.ticker;
        const isActive = activeTicker === node.ticker;

        const radius = (node.baseRadius * scale * (isHovered ? 1.4 : 1.0)) * (isActive ? 1.3 : 1.0);

        // Outer glow
        const gradient = ctx!.createRadialGradient(
          screenX,
          screenY,
          radius * 0.4,
          screenX,
          screenY,
          radius * 2.8
        );
        gradient.addColorStop(0, node.glowColor);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx!.fillStyle = gradient;
        ctx!.beginPath();
        ctx!.arc(screenX, screenY, radius * 2.8, 0, Math.PI * 2);
        ctx!.fill();

        // Core solid circle
        ctx!.fillStyle = node.color;
        ctx!.beginPath();
        ctx!.arc(screenX, screenY, Math.max(2, radius), 0, Math.PI * 2);
        ctx!.fill();

        // Highlight ring if active or hovered
        if (isActive || isHovered) {
          ctx!.strokeStyle = '#ffffff';
          ctx!.lineWidth = 1.8;
          ctx!.beginPath();
          ctx!.arc(screenX, screenY, radius + 3, 0, Math.PI * 2);
          ctx!.stroke();
        }

        // Symbol label
        if (scale > 0.85 || isHovered || isActive) {
          ctx!.font = `${Math.round(10 * scale)}px monospace`;
          ctx!.fillStyle = isHovered ? '#ffffff' : isActive ? '#34d399' : 'rgba(210, 220, 230, 0.75)';
          ctx!.textAlign = 'center';
          ctx!.fillText(node.symbol, screenX, screenY - radius - 5);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isFullscreen, rotationSpeed, activeTicker, hoveredNode, liveQuotes]);

  // Sector list for filter chips
  const sectorChips = [
    { id: 'ALL', label: 'All Portfolio (18)' },
    { id: 'Retail', label: 'Retail & Consumer' },
    { id: 'Tech', label: 'IT & Deep Tech' },
    { id: 'Financials', label: 'Banking & Financials' },
    { id: 'Manufacturing', label: 'EMS & Industrial' },
    { id: 'Infrastructure', label: 'Infra & Energy' },
    { id: 'Healthcare', label: 'Pharma & Chemicals' },
  ];

  // Filtered and Sorted Holdings Matrix List
  const filteredHoldings = useMemo(() => {
    const baseList = searchQuery.trim() ? PORTFOLIO_COMPANIES : CORE_PORTFOLIO;
    return baseList.filter((company) => {

      // Watchlist filter
      if (isMatrixWatchlistOnly && !isWatchlisted(company.ticker)) {
        return false;
      }

      // Sector filter
      if (selectedSector !== 'ALL') {
        const sec = company.sector.toLowerCase();
        if (selectedSector === 'Retail' && !sec.includes('retail') && !sec.includes('consumer') && !sec.includes('tech')) {
          return false;
        }
        if (selectedSector === 'Tech' && !sec.includes('information') && !sec.includes('deep tech')) {
          return false;
        }
        if (selectedSector === 'Financials' && !sec.includes('financial') && !sec.includes('banking')) {
          return false;
        }
        if (selectedSector === 'Manufacturing' && !sec.includes('manufacturing') && !sec.includes('high-tech') && !sec.includes('electronics')) {
          return false;
        }
        if (selectedSector === 'Infrastructure' && !sec.includes('infrastructure') && !sec.includes('energy') && !sec.includes('building')) {
          return false;
        }
        if (selectedSector === 'Healthcare' && !sec.includes('pharma') && !sec.includes('chemical')) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          company.symbol.toLowerCase().includes(q) ||
          company.name.toLowerCase().includes(q) ||
          company.sector.toLowerCase().includes(q)
        );
      }

      return true;
    }).sort((a, b) => {
      const liveA = liveQuotes[a.ticker];
      const liveB = liveQuotes[b.ticker];

      if (sortBy === 'mcap') {
        return b.marketCapCr - a.marketCapCr;
      }
      if (sortBy === 'change') {
        const ca = liveA?.changePercent ?? 0;
        const cb = liveB?.changePercent ?? 0;
        return cb - ca;
      }
      if (sortBy === 'volume') {
        const va = liveA?.volumeRatio ?? 1.0;
        const vb = liveB?.volumeRatio ?? 1.0;
        return vb - va;
      }
      if (sortBy === 'reliability') {
        const ra = HOLDINGS_METADATA[a.ticker]?.reliability ?? 85;
        const rb = HOLDINGS_METADATA[b.ticker]?.reliability ?? 85;
        return rb - ra;
      }
      return 0;
    });
  }, [searchQuery, selectedSector, isMatrixWatchlistOnly, sortBy, liveQuotes, isWatchlisted]);

  return (
    <div className="space-y-6 pb-20" ref={containerRef}>
      {/* 3D Visual Constellation Canvas Card */}
      <div className="relative rounded-2xl bg-gradient-to-b from-neutral-900/90 to-neutral-950 border border-neutral-800 overflow-hidden shadow-2xl">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between p-3 border-b border-neutral-850 bg-neutral-900/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Portfolio Constellation Sphere
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              (18 Core Holdings • Drag to Rotate)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sound.playClick();
                setRotationSpeed((s) => (s === 0.003 ? 0 : 0.003));
              }}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors text-[10px] font-mono flex items-center gap-1"
              title="Toggle Auto Rotation"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">{rotationSpeed > 0 ? 'Pause' : 'Rotate'}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setIsFullscreen((f) => !f);
              }}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 3D Canvas */}
        <canvas
          ref={canvasRef}
          className="block select-none touch-none mx-auto cursor-grab active:cursor-grabbing"
          onClick={() => {
            if (hoveredNode) {
              sound.playClick();
              onSelectTicker(hoveredNode.ticker);
            }
          }}
        />

        {/* Hover Holographic Tooltip */}
        {hoveredNode && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] sm:w-auto sm:min-w-[360px] max-w-md p-3.5 rounded-2xl bg-neutral-900/95 backdrop-blur-xl border border-neutral-700 shadow-2xl animate-in fade-in zoom-in-95 duration-100 z-20 pointer-events-auto box-border">
            <div className="flex items-start justify-between gap-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono font-bold text-white text-sm tracking-wide">
                    {hoveredNode.symbol}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: hoveredNode.color }}
                  ></span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(hoveredNode.ticker);
                    }}
                    className={`p-0.5 rounded transition-colors ${
                      isWatchlisted(hoveredNode.ticker)
                        ? 'text-amber-400 hover:text-amber-300'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                    title={isWatchlisted(hoveredNode.ticker) ? 'Remove from Watchlist' : 'Pin to Watchlist'}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        isWatchlisted(hoveredNode.ticker) ? 'fill-amber-400' : ''
                      }`}
                    />
                  </button>
                  <span className="text-[10px] font-mono text-neutral-400 truncate max-w-[150px] inline-block">
                    {hoveredNode.sector}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-300 truncate max-w-[210px] mt-0.5">
                  {hoveredNode.name}
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-xs font-mono flex-wrap">
                  <span className="text-white font-bold">
                    ₹{hoveredNode.price?.toLocaleString()}
                  </span>
                  {hoveredNode.changePercent !== undefined && (
                    <span
                      className={
                        hoveredNode.changePercent >= 0
                          ? 'text-emerald-400 font-semibold'
                          : 'text-rose-400 font-semibold'
                      }
                    >
                      {hoveredNode.changePercent >= 0 ? '+' : ''}
                      {hoveredNode.changePercent}%
                    </span>
                  )}
                  {hoveredNode.volumeRatio !== undefined && hoveredNode.volumeRatio > 1.2 && (
                    <span className="text-amber-400 text-[10px] bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 shrink-0">
                      {hoveredNode.volumeRatio}x Vol
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons stack cleanly on mobile and align side-by-side on desktop */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0 pt-0.5">
                {onNavigateAudit && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onNavigateAudit(hoveredNode.ticker);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-750 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-mono font-medium transition-colors"
                  >
                    Audit
                  </button>
                )}
                <button
                  onClick={() => {
                    sound.playClick();
                    onSelectTicker(hoveredNode.ticker);
                  }}
                  className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs font-mono flex items-center gap-1 transition-colors shadow-sm"
                >
                  <span>Diligence</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Footer Cluster Legend */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1.5 px-3 text-[10px] font-mono text-neutral-400 border-t border-neutral-850/80 bg-neutral-950/60">
          <span className="text-neutral-500 shrink-0">Clusters:</span>
          <span className="flex items-center gap-1 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Consumer & Retail
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span> Banking & Fin
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span> IT & Software
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Conglomerates
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span> EMS & Hardware
          </span>
        </div>
      </div>

      {/* INSTITUTIONAL HOLDINGS MATRIX / DATA TABLE (Below 3D Constellation) */}
      <div className="space-y-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h3 className="text-white text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Institutional Holdings Matrix</span>
              <span className="text-xs font-mono text-neutral-400 font-normal">
                ({filteredHoldings.length} of {CORE_PORTFOLIO.length})
              </span>

            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Tabular view of portfolio allocations, real-time volume multipliers, and management execution scores.
            </p>
          </div>

          {/* Quick Search & Sort Controls */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter holdings..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 font-mono"
              />
            </div>

            {/* Watchlist Toggle */}
            <button
              onClick={() => {
                sound.playClick();
                setIsMatrixWatchlistOnly(!isMatrixWatchlistOnly);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                isMatrixWatchlistOnly
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold shadow-sm'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  isMatrixWatchlistOnly ? 'fill-amber-400 text-amber-400' : 'text-neutral-400'
                }`}
              />
              <span>★ Pinned ({watchlistCount})</span>
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => {
                sound.playClick();
                setSortBy(e.target.value as any);
              }}
              className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-mono rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="mcap">Sort: Market Cap</option>
              <option value="change">Sort: % Change</option>
              <option value="volume">Sort: Vol Anomaly</option>
              <option value="reliability">Sort: Reliability</option>
            </select>
          </div>
        </div>

        {/* Sector Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {sectorChips.map((chip) => (
            <button
              key={chip.id}
              onClick={() => {
                sound.playClick();
                setSelectedSector(chip.id);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                selectedSector === chip.id
                  ? 'bg-neutral-800 border-neutral-700 text-white font-semibold'
                  : 'bg-neutral-900/60 border-neutral-850 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Matrix Data List */}
        <div className="space-y-2">
          {filteredHoldings.map((company) => {
            const live = liveQuotes[company.ticker];
            const price = live?.price ?? company.basePrice;
            const changePercent = live?.changePercent ?? 0.0;
            const volumeRatio = live?.volumeRatio ?? 1.0;
            const meta = HOLDINGS_METADATA[company.ticker] || {
              mandate: `${company.industry} with steady institutional compounding.`,
              reliability: 90,
              reliabilityTier: 'Solid',
            };
            const isPinned = isWatchlisted(company.ticker);
            const isActive = activeTicker === company.ticker;

            return (
              <div
                key={company.ticker}
                className={`p-3.5 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-neutral-850/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                    : 'bg-neutral-900/70 border-neutral-850 hover:border-neutral-750 hover:bg-neutral-900'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Ticker, Name, Sector & Mandate */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          sound.playClick();
                          onSelectTicker(company.ticker);
                        }}
                        className="font-mono font-bold text-white text-sm hover:text-emerald-400 transition-colors"
                      >
                        {company.symbol}
                      </button>

                      {/* Watchlist Star Pin */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(company.ticker);
                        }}
                        className={`p-0.5 rounded transition-colors ${
                          isPinned
                            ? 'text-amber-400 hover:text-amber-300'
                            : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                        title={isPinned ? 'Remove from Watchlist' : 'Pin to Watchlist'}
                      >
                        <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400' : ''}`} />
                      </button>

                      <span className="text-xs text-neutral-400 truncate max-w-[180px]">
                        {company.name}
                      </span>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-400">
                        {company.sector}
                      </span>

                      {isActive && (
                        <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Active In View
                        </span>
                      )}
                    </div>

                    {/* Investment Mandate / Strategic Driver */}
                    <p className="text-xs text-neutral-300 leading-relaxed font-sans line-clamp-2">
                      <strong className="text-neutral-400 font-medium font-mono text-[11px]">Focus: </strong>
                      {meta.mandate}
                    </p>
                  </div>

                  {/* Right: Metrics & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-850">
                    {/* Live CMP & Change */}
                    <div className="text-right font-mono">
                      <div className="text-sm font-bold text-white">
                        ₹{price.toLocaleString()}
                      </div>
                      <div
                        className={`text-xs font-semibold ${
                          changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {changePercent >= 0 ? '+' : ''}
                        {changePercent}%
                      </div>
                    </div>

                    {/* Volume Multiplier Flag */}
                    <div className="text-right font-mono hidden sm:block">
                      {volumeRatio > 1.4 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                          <Flame className="w-3 h-3 text-amber-400" />
                          <span>{volumeRatio}x Vol</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-neutral-500">
                          {volumeRatio}x vol
                        </span>
                      )}
                    </div>

                    {/* Reliability Pill */}
                    <div className="text-right hidden md:block">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-neutral-300 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>{meta.reliability}% Rel</span>
                      </span>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      {onNavigateAudit && (
                        <button
                          onClick={() => {
                            sound.playClick();
                            onNavigateAudit(company.ticker);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-amber-300 border border-amber-500/20 hover:border-amber-500/40 text-xs font-mono transition-colors"
                          title="Audit Guidance Divergence"
                        >
                          Audit
                        </button>
                      )}

                      <button
                        onClick={() => {
                          sound.playClick();
                          onSelectTicker(company.ticker);
                        }}
                        className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs font-mono flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <span>Diligence</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
