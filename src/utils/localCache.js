/**
 * Shared localStorage cache helper.
 *
 * Every cached entry is stored under a common `pf_cache:` prefix so we can
 * find and prune all of them together (see pruneExpiredCache), and every
 * entry expires after CACHE_TTL_MS regardless of which feature wrote it —
 * the public portfolio data, the admin panel's cached reads, all of it.
 */

const PREFIX = 'pf_cache:';
export const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function fullKey(key) {
  return `${PREFIX}${key}`;
}

/**
 * Reads a cache entry. Returns null (and removes the entry) if it doesn't
 * exist, is corrupted, or is older than CACHE_TTL_MS.
 */
export function getCache(key) {
  try {
    const raw = localStorage.getItem(fullKey(key));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.cachedAt !== 'number') {
      localStorage.removeItem(fullKey(key));
      return null;
    }

    if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) {
      localStorage.removeItem(fullKey(key));
      return null;
    }

    return parsed.data;
  } catch (err) {
    console.warn(`[localCache] Failed to read "${key}", clearing it:`, err.message);
    try {
      localStorage.removeItem(fullKey(key));
    } catch {
      /* ignore */
    }
    return null;
  }
}

/**
 * Writes a cache entry. Returns true on success, false if the write failed
 * (most commonly localStorage quota exceeded — logged clearly so it's
 * visible in the console instead of silently doing nothing).
 */
export function setCache(key, data) {
  try {
    const payload = JSON.stringify({ data, cachedAt: Date.now() });
    localStorage.setItem(fullKey(key), payload);
    return true;
  } catch (err) {
    console.warn(
      `[localCache] Failed to write "${key}" (${(JSON.stringify(data)?.length || 0)} chars) — ` +
        `likely localStorage quota exceeded. This entry will not be cached.`,
      err
    );
    return false;
  }
}

export function clearCache(key) {
  try {
    localStorage.removeItem(fullKey(key));
  } catch {
    /* ignore */
  }
}

/**
 * Actively sweeps every pf_cache:* entry in localStorage and deletes any
 * that are older than CACHE_TTL_MS — not just on next read, but proactively.
 * Call this once on app startup (see main.jsx).
 */
export function pruneExpiredCache() {
  try {
    const now = Date.now();
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (!storageKey || !storageKey.startsWith(PREFIX)) continue;

      try {
        const parsed = JSON.parse(localStorage.getItem(storageKey));
        if (!parsed || typeof parsed.cachedAt !== 'number' || now - parsed.cachedAt > CACHE_TTL_MS) {
          keysToRemove.push(storageKey);
        }
      } catch {
        // Corrupted entry — remove it too.
        keysToRemove.push(storageKey);
      }
    }

    keysToRemove.forEach((k) => localStorage.removeItem(k));
    if (keysToRemove.length > 0) {
      console.info(`[localCache] Pruned ${keysToRemove.length} expired/corrupted cache entr${keysToRemove.length === 1 ? 'y' : 'ies'}.`);
    }
  } catch (err) {
    console.warn('[localCache] Prune sweep failed:', err.message);
  }
}
