'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { sound } from '@/lib/sound';

export type Theme = 'dark' | 'light';
export type AccentColor = 'emerald' | 'blue' | 'violet' | 'amber' | 'rose';

export interface AccentOption {
  id: AccentColor;
  name: string;
  colorHex: string;
  badgeLabel: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { id: 'emerald', name: 'Emerald', colorHex: '#10b981', badgeLabel: 'ENAM Terminal' },
  { id: 'blue', name: 'Sapphire', colorHex: '#3b82f6', badgeLabel: 'Institutional' },
  { id: 'violet', name: 'Amethyst', colorHex: '#8b5cf6', badgeLabel: 'Linear Modern' },
  { id: 'amber', name: 'Amber Gold', colorHex: '#f59e0b', badgeLabel: 'Private Wealth' },
  { id: 'rose', name: 'Crimson', colorHex: '#f43f5e', badgeLabel: 'High Alpha' },
];

interface ThemeContextType {
  theme: Theme;
  accent: AccentColor;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setAccent: (accent: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  accent: 'emerald',
  toggleTheme: () => {},
  setTheme: () => {},
  setAccent: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [accent, setAccentState] = useState<AccentColor>('emerald');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = (localStorage.getItem('finn_theme') as Theme) || 'dark';
      const savedAccent = (localStorage.getItem('finn_accent') as AccentColor) || 'emerald';
      
      setThemeState(savedTheme);
      setAccentState(savedAccent);

      applyThemeAndAccent(savedTheme, savedAccent);
      setMounted(true);
    } catch {
      applyThemeAndAccent('dark', 'emerald');
      setMounted(true);
    }
  }, []);

  const applyThemeAndAccent = (newTheme: Theme, newAccent: AccentColor) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(newTheme);
    root.setAttribute('data-theme', newTheme);
    root.setAttribute('data-accent', newAccent);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('finn_theme', newTheme);
    } catch {}
    applyThemeAndAccent(newTheme, accent);
  };

  const setAccent = (newAccent: AccentColor) => {
    sound.playClick();
    setAccentState(newAccent);
    try {
      localStorage.setItem('finn_accent', newAccent);
    } catch {}
    applyThemeAndAccent(theme, newAccent);
  };

  const toggleTheme = () => {
    sound.playClick();
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, accent, toggleTheme, setTheme, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
