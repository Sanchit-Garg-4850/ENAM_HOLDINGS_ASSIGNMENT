'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Maximize2, Minimize2, RotateCcw, ArrowRight, Eye } from 'lucide-react';
import { PORTFOLIO_COMPANIES } from '@/data/portfolio';
import { sound } from '@/lib/sound';
import { useTheme } from '@/lib/themeContext';

interface PortfolioConstellation3DProps {
  onSelectTicker: (ticker: string) => void;
  activeTicker: string;
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

export function PortfolioConstellation3D({
  onSelectTicker,
  activeTicker,
}: PortfolioConstellation3DProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [hoveredNode, setHoveredNode] = useState<Node3D | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(0.003);
  const [liveQuotes, setLiveQuotes] = useState<Record<string, { price: number; changePercent: number; volumeRatio: number }>>({});

  // Fetch live quotes from /api/portfolio
  useEffect(() => {
    async function loadLiveQuotes() {
      try {
        const res = await fetch('/api/portfolio');
        const json = await res.json();
        if (json.success && json.data) {
          const map: Record<string, { price: number; changePercent: number; volumeRatio: number }> = {};
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
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = isFullscreen ? 550 : 340);

    // Generate 3D spherical positions for all companies using Fibonacci Sphere Distribution
    const count = PORTFOLIO_COMPANIES.length;
    const sphereRadius = Math.min(width, height) * 0.38;

    const nodes: Node3D[] = PORTFOLIO_COMPANIES.map((company, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      const colorSet = sectorColors[company.sector] || {
        main: '#10b981',
        glow: 'rgba(16, 185, 129, 0.4)',
      };

      // Size scaled roughly to log(marketCap)
      const radius = company.marketCapCategory === 'Mega Cap' ? 12 : company.marketCapCategory === 'Large Cap' ? 9 : 7;
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
      const mouseX = e.clientX - rect.left - width / 2;
      const mouseY = e.clientY - rect.top - height / 2;

      if (isDragging) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        angleY = deltaX * 0.006;
        angleX = -deltaY * 0.006;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      } else {
        // Detect hovering over nodes in projected 2D space
        let found: Node3D | null = null;
        for (const n of nodes) {
          const fov = 350;
          const scale = fov / (fov + n.z);
          const projX = n.x * scale;
          const projY = n.y * scale;
          const r = n.baseRadius * scale;

          const dist = Math.hypot(mouseX - projX, mouseY - projY);
          if (dist < r + 8 && n.z > -100) {
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

    // Touch support for mobile
    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length === 1) {
        isDragging = true;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - lastMouseX;
        const deltaY = e.touches[0].clientY - lastMouseY;
        angleY = deltaX * 0.008;
        angleX = -deltaY * 0.008;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
      }
    }

    function handleTouchEnd() {
      isDragging = false;
    }

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    // Animation Render Loop
    function render() {
      ctx!.clearRect(0, 0, width, height);

      // Rotate nodes around axes
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      nodes.forEach((n) => {
        // Rotate Y
        const x1 = n.x * cosY + n.z * sinY;
        const z1 = -n.x * sinY + n.z * cosY;

        // Rotate X
        const y2 = n.y * cosX - z1 * sinX;
        const z2 = n.y * sinX + z1 * cosX;

        n.x = x1;
        n.y = y2;
        n.z = z2;
      });

      // Damping of manual drag
      if (!isDragging) {
        angleX *= 0.95;
        angleY = angleY * 0.95 + rotationSpeed * 0.05;
      }

      // Sort nodes back-to-front (Painter's algorithm)
      const sorted = [...nodes].sort((a, b) => b.z - a.z);

      // Draw constellation connections between nodes of same sector
      ctx!.lineWidth = 0.5;
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          if (sorted[i].sector === sorted[j].sector) {
            const fov = 350;
            const s1 = fov / (fov + sorted[i].z);
            const s2 = fov / (fov + sorted[j].z);

            const x1 = width / 2 + sorted[i].x * s1;
            const y1 = height / 2 + sorted[i].y * s1;
            const x2 = width / 2 + sorted[j].x * s2;
            const y2 = height / 2 + sorted[j].y * s2;

            const alpha = Math.max(0.05, Math.min(0.25, ((sorted[i].z + sorted[j].z) / 2 + sphereRadius) / (sphereRadius * 2)));
            ctx!.strokeStyle = isDark ? `rgba(16, 185, 129, ${alpha})` : `rgba(5, 150, 105, ${alpha * 1.3})`;
            ctx!.beginPath();
            ctx!.moveTo(x1, y1);
            ctx!.lineTo(x2, y2);
            ctx!.stroke();
          }
        }
      }

      // Draw nodes
      sorted.forEach((n) => {
        const fov = 350;
        const scale = fov / (fov + n.z);
        const projX = width / 2 + n.x * scale;
        const projY = height / 2 + n.y * scale;
        const radius = Math.max(2, n.baseRadius * scale);

        const isHovered = hoveredNode?.ticker === n.ticker;
        const isActive = activeTicker === n.ticker;

        // Glow ring
        if (isHovered || isActive) {
          ctx!.beginPath();
          ctx!.arc(projX, projY, radius + (isActive ? 8 : 5), 0, Math.PI * 2);
          ctx!.fillStyle = n.glowColor;
          ctx!.fill();
        }

        // Core orb
        ctx!.beginPath();
        ctx!.arc(projX, projY, radius, 0, Math.PI * 2);
        ctx!.fillStyle = n.color;
        ctx!.shadowColor = n.color;
        ctx!.shadowBlur = isActive || isHovered ? 12 : 4;
        ctx!.fill();
        ctx!.shadowBlur = 0;

        // Ticker symbol label
        if (scale > 0.85 || isHovered || isActive) {
          ctx!.font = `${isActive ? 'bold' : 'normal'} ${Math.round(10 * scale)}px monospace`;
          ctx!.fillStyle = isDark
            ? (isHovered || isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)')
            : (isHovered || isActive ? '#0f172a' : 'rgba(30, 41, 59, 0.8)');
          ctx!.textAlign = 'center';
          ctx!.fillText(n.symbol, projX, projY - radius - 3);
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
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeTicker, hoveredNode, isFullscreen, rotationSpeed, liveQuotes, isDark]);

  return (
    <div
      ref={containerRef}
      className={`relative rounded-2xl bg-neutral-950/90 border border-neutral-800 overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 bg-neutral-950 flex flex-col' : 'p-3'
      }`}
    >
      {/* Top Controls Overlay */}
      <div className="flex items-center justify-between gap-2 mb-1 px-2 pt-1 z-10 relative">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            3D Portfolio Constellation
          </span>
          <span className="text-[10px] text-neutral-500 hidden sm:inline font-mono">
            (Drag to Rotate • Touch to Inspect)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playClick();
              setIsFullscreen(!isFullscreen);
            }}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative flex-1 flex items-center justify-center cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          className="w-full h-auto block select-none touch-none"
          onClick={() => {
            if (hoveredNode) {
              sound.playClick();
              onSelectTicker(hoveredNode.ticker);
            }
          }}
        />

        {/* Hover Holographic Tooltip */}
        {hoveredNode && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs p-3 rounded-xl bg-neutral-900/95 backdrop-blur-md border border-neutral-750 shadow-2xl animate-in fade-in zoom-in-95 duration-100 z-20 pointer-events-auto">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-white text-sm">
                    {hoveredNode.symbol}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: hoveredNode.color }}
                  ></span>
                </div>
                <div className="text-[11px] text-neutral-400 truncate max-w-[200px]">
                  {hoveredNode.name}
                </div>
                <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                  {hoveredNode.sector}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs font-mono">
                  <span className="text-white font-semibold">₹{hoveredNode.price?.toLocaleString()}</span>
                  {hoveredNode.changePercent !== undefined && (
                    <span className={hoveredNode.changePercent >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                      {hoveredNode.changePercent >= 0 ? '+' : ''}{hoveredNode.changePercent}%
                    </span>
                  )}
                  {hoveredNode.volumeRatio !== undefined && hoveredNode.volumeRatio > 1.2 && (
                    <span className="text-amber-400 text-[10px] bg-amber-500/10 px-1 rounded border border-amber-500/20">
                      {hoveredNode.volumeRatio}x Vol
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  onSelectTicker(hoveredNode.ticker);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs font-mono flex items-center gap-1 transition-colors"
              >
                <span>Diligence</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Sector Legend Bar */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1.5 px-2 text-[10px] font-mono text-neutral-400 border-t border-neutral-850/80 mt-1">
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
          <span className="w-2 h-2 rounded-full bg-red-400"></span> Tech Platforms
        </span>
      </div>
    </div>
  );
}
