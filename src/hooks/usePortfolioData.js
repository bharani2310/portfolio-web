import { useEffect, useState } from 'react';
import dataApi from '../api/dataApi';

const CACHE_KEY = 'portfolio_all_data';
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, cachedAt } = JSON.parse(raw);
    if (Date.now() - cachedAt > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, cachedAt: Date.now() }));
  } catch (e) {
    // localStorage quota exceeded — images may be too large; skip silently
    console.warn('Portfolio cache write failed (quota?):', e.message);
  }
}

export function usePortfolioData() {
  const [data, setData] = useState(() => readCache());
  const [loading, setLoading] = useState(!readCache());
  const [error, setError] = useState(null);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    dataApi
      .get('/all')
      .then((res) => {
        if (cancelled) return;
        writeCache(res.data);
        setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load portfolio data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /** Call this after admin saves to bust the cache so visitors get fresh data. */
  const invalidateCache = () => {
    localStorage.removeItem(CACHE_KEY);
  };

  return { data, loading, error, invalidateCache };
}
