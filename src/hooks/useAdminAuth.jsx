import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/adminService';
import { clearCache } from '../utils/localCache';
import { ADMIN_TOKEN_EXPIRED_EVENT } from '../utils/authEvents';

const AdminAuthContext = createContext();

// Cached admin reads (see useCachedFetch) — cleared on every logout so a
// stale/expired session's data can never linger into the next login.
const ADMIN_CACHE_KEYS = ['admin_profile', 'admin_experience', 'admin_skills', 'admin_projects'];

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken'));
  const [admin, setAdmin] = useState(null);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('adminToken', data.token);
    setToken(data.token);
    setAdmin(data.admin);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    ADMIN_CACHE_KEYS.forEach(clearCache);
    setToken(null);
    setAdmin(null);
  };

  // If any API call comes back 401 (token expired, revoked, etc.), the
  // axios interceptor dispatches this event. We react to it here so the
  // live app state actually reflects "logged out" immediately — not just
  // localStorage — even if the admin is sitting on a page and never
  // triggers a manual logout or a page reload.
  useEffect(() => {
    const handleExpired = () => logout();
    window.addEventListener(ADMIN_TOKEN_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(ADMIN_TOKEN_EXPIRED_EVENT, handleExpired);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminAuthContext.Provider value={{ token, admin, login, logout, isAuthenticated: !!token }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
