import { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api.js';
import { setAxiosToken } from '../api/axiosInstance.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null); // ← memory only, NOT localStorage
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

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    const { user: userData, accessToken: token } = res.data.data;
    setAccessToken(token);
    setAxiosToken(token); 
    setUser(userData);
    return res.data;
  }, []);

  const register = useCallback(async (data) => {
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
    const res = await authApi.refreshToken();
    const { accessToken: token, user: userData } = res.data.data;
    setAccessToken(token);
    setAxiosToken(token); 
    if (userData) setUser(userData);
    return token;
  }, []);

  const updateUser = useCallback((updatedUser) => {
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
      {!loading && children}
    </AuthContext.Provider>
  );
};