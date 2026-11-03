'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { sound } from '@/lib/sound';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('finn_theme') as Theme) || 'dark';
    setThemeState(savedTheme);
    applyThemeClass(savedTheme);
    setMounted(true);
  }, []);

  const applyThemeClass = (newTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(newTheme);
    root.setAttribute('data-theme', newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('finn_theme', newTheme);
    applyThemeClass(newTheme);
  };

  const toggleTheme = () => {
    sound.playClick();
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
