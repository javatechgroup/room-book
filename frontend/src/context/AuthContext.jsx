import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  TOKEN: 'meetspace_token',
  USER: 'meetspace_user',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Restore session on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);

      if (savedToken && savedUser) {
        // Validate JWT expiration if exp claim is present
        try {
          const parts = savedToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload.exp && payload.exp * 1000 <= Date.now()) {
              console.warn('Stored JWT session has expired. Clearing local credentials.');
              localStorage.removeItem(STORAGE_KEYS.TOKEN);
              localStorage.removeItem(STORAGE_KEYS.USER);
              setLoading(false);
              return;
            }
          }
        } catch {
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          setLoading(false);
          return;
        }

        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to restore session from storage', e);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for unauthorized or session expiry events from apiClient
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      setIsLoginOpen(true);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const result = await authApi.login(email, password);

    if (result.success && result.data) {
      const { accessToken, ...userData } = result.data;
      setToken(accessToken);
      setUser(userData);

      try {
        localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      } catch (e) {
        console.error('Failed to persist session to storage', e);
      }

      setIsLoginOpen(false);
      return { success: true, user: userData };
    }

    return {
      success: false,
      error: result.error || 'Authentication failed',
    };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (e) {
      console.error('Failed to clear session storage', e);
    }
  };

  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const openLogin = () => {
    setIsForgotOpen(false);
    setIsResetOpen(false);
    setIsLoginOpen(true);
  };
  const closeLogin = () => setIsLoginOpen(false);

  const openConnect = () => setIsConnectOpen(true);
  const closeConnect = () => setIsConnectOpen(false);

  const openForgotPassword = () => {
    setIsLoginOpen(false);
    setIsResetOpen(false);
    setIsForgotOpen(true);
  };
  const closeForgotPassword = () => setIsForgotOpen(false);

  const openResetPassword = (token = '') => {
    setIsLoginOpen(false);
    setIsForgotOpen(false);
    if (token) setResetToken(token);
    setIsResetOpen(true);
  };
  const closeResetPassword = () => {
    setIsResetOpen(false);
    setResetToken('');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    isLoginOpen,
    openLogin,
    closeLogin,
    isConnectOpen,
    openConnect,
    closeConnect,
    isForgotOpen,
    openForgotPassword,
    closeForgotPassword,
    isResetOpen,
    resetToken,
    openResetPassword,
    closeResetPassword,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
