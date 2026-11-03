'use client';

import { useState, useEffect, useCallback } from 'react';
import { sound } from './sound';

const WATCHLIST_STORAGE_KEY = 'finn_watchlist';
const WATCHLIST_EVENT = 'finn_watchlist_updated';

// High-conviction seed portfolio symbols
export const DEFAULT_WATCHLIST = ['TRENT.NS', 'KAYNES.NS', 'HAL.NS', 'RELIANCE.NS'];

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_WATCHLIST);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWatchlist(parsed);
        } else {
          setWatchlist(DEFAULT_WATCHLIST);
          localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(DEFAULT_WATCHLIST));
        }
      } else {
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(DEFAULT_WATCHLIST));
      }
    } catch {
      // Fallback to default in restricted sandbox
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Listen for sync events across tabs / components
  useEffect(() => {
    function handleSync() {
      try {
        const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setWatchlist(parsed);
          }
        }
      } catch {
        // Ignore
      }
    }

    window.addEventListener('storage', handleSync);
    window.addEventListener(WATCHLIST_EVENT, handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener(WATCHLIST_EVENT, handleSync);
    };
  }, []);

  // Persist and dispatch sync event
  const saveWatchlist = useCallback((newList: string[]) => {
    setWatchlist(newList);
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(newList));
      window.dispatchEvent(new Event(WATCHLIST_EVENT));
    } catch {
      // Ignore
    }
  }, []);

  const isWatchlisted = useCallback(
    (ticker: string) => {
      const normalized = ticker.endsWith('.NS') ? ticker : `${ticker}.NS`;
      return watchlist.includes(normalized) || watchlist.includes(ticker);
    },
    [watchlist]
  );

  const toggleWatchlist = useCallback(
    (ticker: string) => {
      const normalized = ticker.endsWith('.NS') ? ticker : `${ticker}.NS`;
      const exists = watchlist.includes(normalized) || watchlist.includes(ticker);
      let updated: string[];

      if (exists) {
        updated = watchlist.filter((t) => t !== normalized && t !== ticker);
        sound.playClick();
      } else {
        updated = [...watchlist, normalized];
        sound.playChime();
      }

      saveWatchlist(updated);
    },
    [watchlist, saveWatchlist]
  );

  const addToWatchlist = useCallback(
    (ticker: string) => {
      const normalized = ticker.endsWith('.NS') ? ticker : `${ticker}.NS`;
      if (!isWatchlisted(normalized)) {
        const updated = [...watchlist, normalized];
        saveWatchlist(updated);
        sound.playChime();
      }
    },
    [watchlist, isWatchlisted, saveWatchlist]
  );

  const removeFromWatchlist = useCallback(
    (ticker: string) => {
      const normalized = ticker.endsWith('.NS') ? ticker : `${ticker}.NS`;
      const updated = watchlist.filter((t) => t !== normalized && t !== ticker);
      saveWatchlist(updated);
      sound.playClick();
    },
    [watchlist, saveWatchlist]
  );

  return {
    watchlist,
    isLoaded,
    isWatchlisted,
    toggleWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    watchlistCount: watchlist.length,
  };
}
