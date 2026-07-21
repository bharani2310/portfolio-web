import { useEffect, useState } from 'react';
import dataApi from '../api/dataApi';
import { getCache, setCache, clearCache } from '../utils/localCache';

const CACHE_KEY = 'portfolio_all_data';

/**
 * Cache entry shape stored under CACHE_KEY:
 *   { payload: <the /all response body>, version: <middleware's updatedAt string> }
 *
 * "version" is the middleware's cache timestamp (see /api/version), NOT the
 * localStorage TTL — it's what lets us tell "this data is still current"
 * apart from "this data hasn't expired yet". The two are independent:
 * localCache's own 1-hour TTL still applies on top of this and will force
 * a refetch regardless, but this version check is what makes a same-tab
 * refresh pick up an admin's change immediately instead of waiting up to
 * an hour for the TTL to lapse.
 */

export function usePortfolioData() {
  const initialCached = getCache(CACHE_KEY);
  const [data, setData] = useState(() => initialCached?.payload ?? null);
  const [loading, setLoading] = useState(() => !initialCached);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchFresh = async () => {
      const res = await dataApi.get('/all');
      if (cancelled) return;
      // Body field, not a response header — custom headers like
      // X-Cache-Updated-At aren't readable on cross-origin responses
      // unless the server sends Access-Control-Expose-Headers, so we rely
      // on generatedAt inside the JSON body instead (always readable).
      const version = res.data?.generatedAt ?? null;
      setCache(CACHE_KEY, { payload: res.data, version });
      setData(res.data);
    };

    const run = async () => {
      const cached = getCache(CACHE_KEY);

      // No usable local cache at all -> normal loading fetch, same as before.
      if (!cached) {
        setLoading(true);
        try {
          await fetchFresh();
        } catch (err) {
          if (!cancelled) setError(err.message || 'Failed to load portfolio data');
        } finally {
          if (!cancelled) setLoading(false);
        }
        return;
      }

      // We have cached data -> show it immediately, no loading spinner.
      setData(cached.payload);
      setLoading(false);

      // Then ping the middleware for its current version. This is a tiny
      // request (just a timestamp, not the full payload), so it's cheap to
      // fire on every mount/refresh. Only pull the full data again if the
      // backend has actually changed since we cached it.
      try {
        const versionRes = await dataApi.get('/version');
        if (cancelled) return;
        const serverVersion = versionRes.data?.updatedAt;
        if (serverVersion && serverVersion !== cached.version) {
          await fetchFresh();
        }
      } catch (err) {
        // Version check failing (offline, worker cold-starting, etc.)
        // shouldn't disturb the page — just keep serving what's cached.
        console.warn('[usePortfolioData] Version check failed, keeping cached data:', err.message);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  /** Call this after admin saves to bust the cache so visitors get fresh data. */
  const invalidateCache = () => clearCache(CACHE_KEY);

  return { data, loading, error, invalidateCache };
}