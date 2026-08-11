import { createContext, useContext, useMemo, useState } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

function readStoredUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

function readStoredBusiness() {
  const raw = localStorage.getItem('business');
  return raw ? JSON.parse(raw) : null;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(readStoredUser);
  const [business, setBusiness] = useState(readStoredBusiness);

  function persist(result) {
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    localStorage.setItem('business', JSON.stringify(result.business));
    setToken(result.token);
    setUser(result.user);
    setBusiness(result.business);
  }

  async function login(credentials) {
    const result = await authApi.login(credentials);
    persist(result);
  }

  async function register(payload) {
    const result = await authApi.register(payload);
    persist(result);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('business');
    setToken(null);
    setUser(null);
    setBusiness(null);
  }

  const value = useMemo(
    () => ({ token, user, business, login, register, logout, isAuthenticated: !!token }),
    [token, user, business]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
