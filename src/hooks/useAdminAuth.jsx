import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { authService } from '../services/adminService';
import { clearCache } from '../utils/localCache';
import { ADMIN_TOKEN_EXPIRED_EVENT } from '../utils/authEvents';
import { getTokenExpiryMs, isTokenExpired } from '../utils/jwt';

const AdminAuthContext = createContext();

// Cached admin reads (see useCachedFetch) — cleared on every logout so a
// stale/expired session's data can never linger into the next login.
const ADMIN_CACHE_KEYS = ['admin_profile', 'admin_experience', 'admin_skills', 'admin_projects'];

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('adminToken');
    // Don't even start the session with an already-expired token —
    // this covers "left the tab closed/idle past expiry, reopened it".
    if (stored && isTokenExpired(stored)) {
      localStorage.removeItem('adminToken');
      return null;
    }
    return stored;
  });
  const [admin, setAdmin] = useState(null);
  const expiryTimerRef = useRef(null);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('adminToken', data.token);
    setToken(data.token);
    setAdmin(data.admin);
    return data;
  };

  const logout = () => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
    localStorage.removeItem('adminToken');
    ADMIN_CACHE_KEYS.forEach(clearCache);
    setToken(null);
    setAdmin(null);
  };

  // Proactively log out the exact moment the token's own `exp` claim
  // passes — this does NOT depend on any API call happening. Covers the
  // "admin sits idle on a page, no request fires, token quietly expires"
  // case that a 401-only approach can never catch.
  useEffect(() => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }

    if (!token) return;

    if (isTokenExpired(token)) {
      logout();
      return;
    }

    const expiryMs = getTokenExpiryMs(token);
    if (expiryMs === null) return; // can't read exp — nothing to schedule

    const msUntilExpiry = expiryMs - Date.now();
    // setTimeout has a ~24.8 day max delay; clamp defensively.
    const delay = Math.min(msUntilExpiry, 2 ** 31 - 1);

    expiryTimerRef.current = setTimeout(() => {
      logout();
    }, delay);

    return () => {
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Also react to a 401 coming back from any API call (revoked token,
  // clock skew, server-side invalidation before the JWT's own exp, etc.)
  // as a fallback on top of the proactive timer above.
  useEffect(() => {
    const handleExpired = () => logout();
    window.addEventListener(ADMIN_TOKEN_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(ADMIN_TOKEN_EXPIRED_EVENT, handleExpired);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Also catch expiry when the tab regains focus/visibility after being
  // backgrounded — timers can be throttled/paused in background tabs, so
  // this is a belt-and-braces check for "came back after expiry".
  useEffect(() => {
    const checkOnFocus = () => {
      const stored = localStorage.getItem('adminToken');
      if (stored && isTokenExpired(stored)) {
        logout();
      }
    };
    window.addEventListener('focus', checkOnFocus);
    document.addEventListener('visibilitychange', checkOnFocus);
    return () => {
      window.removeEventListener('focus', checkOnFocus);
      document.removeEventListener('visibilitychange', checkOnFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminAuthContext.Provider value={{ token, admin, login, logout, isAuthenticated: !!token }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
