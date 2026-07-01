import { useEffect, useState, useCallback } from 'react';

/**
 * useFetch - generic hook to call a service function and track
 * loading / error / data state. Used by every section so that
 * no portfolio data is ever hardcoded in components.
 */
export default function useFetch(serviceFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceFn();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
