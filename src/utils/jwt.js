/**
 * Minimal JWT payload decoder — no signature verification (that's the
 * server's job on every request). This is purely so the frontend can know
 * "when does this token expire" and proactively log out at that exact
 * moment, without waiting for an API call to fail first.
 */
export function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Returns the token's expiry as an epoch-ms timestamp, or null if unreadable. */
export function getTokenExpiryMs(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return null;
  return payload.exp * 1000; // JWT exp is in seconds, JS timestamps are ms
}

/** True if the token is missing/unreadable/expired. */
export function isTokenExpired(token) {
  if (!token) return true;
  const expiryMs = getTokenExpiryMs(token);
  if (expiryMs === null) return false; // can't read exp — don't assume expired
  return Date.now() >= expiryMs;
}
