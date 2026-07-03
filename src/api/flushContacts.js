import dataApi from './dataApi';

/**
 * Tells the middleware to immediately flush any contact messages it has
 * buffered in Cloudflare KV over to the Render backend, instead of
 * waiting for the scheduled 6-hour cron flush.
 *
 * Hits POST /test-flush on the middleware (dataApi's baseURL already ends
 * in /api, so this resolves to .../api/test-flush).
 */
export async function flushContacts() {
  const response = await dataApi.post('/message-refresh');
  const data = response?.data;

  if (!data || typeof data.flushed !== 'number' || typeof data.remaining !== 'number') {
    // The request came back 2xx but the body wasn't the shape we expect.
    // Surface this as a real error instead of silently reporting "0
    // flushed" — that would look identical to a genuine empty queue and
    // hide whatever's actually wrong (stale deploy, wrong route, etc).
    console.error('Unexpected /test-flush response:', {
      status: response?.status,
      headers: response?.headers,
      data,
    });
    throw new Error(
      `Middleware returned an unexpected response (status ${response?.status ?? 'unknown'}). Check the console for details.`
    );
  }

  return data; // { flushed, remaining }
}
