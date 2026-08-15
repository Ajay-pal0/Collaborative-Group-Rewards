import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/apiServices';
import type { User, AuthTokens } from '../types';

interface AuthContextType {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>(() => {
    return localStorage.getItem('access_token') ? 'loading' : 'unauthenticated';
  });

  // Restore session on mount (Req 3)
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    authApi
      .getCurrentUser()
      .then((res) => {
        setUser(res.data);
        setStatus('authenticated');
      })
      .catch(() => {
        // Clear token on 401 or any non-2xx (Req 3.3 & 3.4)
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setStatus('unauthenticated');
      });
  }, []);

  const login = (userData: User, tokens: AuthTokens) => {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    setUser(userData);
    setStatus('authenticated');
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setStatus('unauthenticated');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, status, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
