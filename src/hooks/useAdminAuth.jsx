import React, { createContext, useContext, useState } from 'react';
import { authService } from '../services/adminService';

const AdminAuthContext = createContext();

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
    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ token, admin, login, logout, isAuthenticated: !!token }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
