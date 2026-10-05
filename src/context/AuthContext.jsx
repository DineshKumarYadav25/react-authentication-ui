import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(null);

  // Restore session if present
  useEffect(() => {
    const existing = authService.getCurrentUser();
    if (existing) {
      setUser(existing);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setAuthError(null);
    setAuthSuccess(null);
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setAuthSuccess(response.message || 'Login successful!');
      return { success: true, user: response.user };
    } catch (err) {
      const errorMsg = err.message || 'Authentication failed. Please try again.';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setAuthError(null);
    setAuthSuccess(null);
  }, []);

  const value = {
    user,
    isLoading,
    authError,
    authSuccess,
    login,
    logout,
    clearMessages,
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
