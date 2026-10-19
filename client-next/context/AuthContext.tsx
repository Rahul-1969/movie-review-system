"use client";

import React, { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import { authApi } from '../lib/api/auth.api';
import { setAxiosToken } from '../lib/api/client';
import { User, LoginCredentials, RegisterData, AuthResponseData, ApiResponse } from '../types';

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<ApiResponse<AuthResponseData>>;
  register: (data: RegisterData) => Promise<ApiResponse<AuthResponseData>>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
  updateUser: (updatedUser: User | null) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null); // memory only, NOT localStorage
  const [loading, setLoading] = useState(true);

  // On app load, try silent refresh using httpOnly cookie
  useEffect(() => {
    const init = async () => {
      try {
        const res = await authApi.refreshToken();
        const { accessToken: token, user: userData } = res.data.data;
        setAccessToken(token);
        setAxiosToken(token); 
        setUser(userData);
      } catch {
        // No valid session — user stays logged out
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const res = await authApi.login(credentials);
    const { user: userData, accessToken: token } = res.data.data;
    setAccessToken(token);
    setAxiosToken(token); 
    setUser(userData);
    return res.data;
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const res = await authApi.register(data);
    const { user: userData, accessToken: token } = res.data.data;
    setAccessToken(token);
    setAxiosToken(token); 
    setUser(userData);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      setAccessToken(null);
      setAxiosToken(null); 
      setUser(null);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const res = await authApi.refreshToken();
      const { accessToken: token, user: userData } = res.data.data;
      setAccessToken(token);
      setAxiosToken(token); 
      if (userData) setUser(userData);
      return token;
    } catch {
      return null;
    }
  }, []);

  const updateUser = useCallback((updatedUser: User | null) => {
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refreshToken,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
