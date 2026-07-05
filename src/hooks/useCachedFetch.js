import { useCallback, useEffect, useState } from 'react';
import { getCache, setCache } from '../utils/localCache';

/**
 * useCachedFetch — same API as useFetch ({ data, loading, error, refetch }),
 * but backed by the shared 1-hour localStorage cache.
 *
 * Stale-while-revalidate: if a cached value exists, it's shown immediately
 * (loading starts false) while a background request silently refreshes it.
 * If there's no cached value yet, it behaves just like a normal fetch
 * (loading starts true) and populates the cache once it resolves.
 *
 * This gives the admin panel the same instant-repeat-visit feel as the
 * public site, without ever showing stale data for more than a moment.
 */
export default function useCachedFetch(cacheKey, serviceFn, deps = []) {
  const [data, setData] = useState(() => getCache(cacheKey));
  const [loading, setLoading] = useState(() => getCache(cacheKey) === null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        const result = await serviceFn();
        setData(result);
        setCache(cacheKey, result);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        if (!silent) setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [cacheKey, ...deps]
  );

  useEffect(() => {
    const cached = getCache(cacheKey);
    // Cache hit -> show it immediately, then quietly revalidate in the
    // background. Cache miss -> normal loading fetch.
    fetchData(cached !== null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
