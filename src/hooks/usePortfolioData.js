import { useEffect, useState } from 'react';
import dataApi from '../api/dataApi';
import { getCache, setCache, clearCache } from '../utils/localCache';

const CACHE_KEY = 'portfolio_all_data';

export function usePortfolioData() {
  const [data, setData] = useState(() => getCache(CACHE_KEY));
  const [loading, setLoading] = useState(() => !getCache(CACHE_KEY));
  const [error, setError] = useState(null);

  useEffect(() => {
    const cached = getCache(CACHE_KEY);
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
        setCache(CACHE_KEY, res.data);
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
  const invalidateCache = () => clearCache(CACHE_KEY);

  return { data, loading, error, invalidateCache };
}
