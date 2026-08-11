import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStoredToken, removeStoredToken } from '@/api/storage';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  hasStarted: boolean;
  initialAuthMode: 'login' | 'register' | null;
  setHasStarted: (started: boolean) => void;
  login: () => void;
  logout: () => Promise<void>;
  openLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [initialAuthMode, setInitialAuthMode] = useState<'login' | 'register' | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkToken = async () => {
      const token = await getStoredToken();
      if (token) {
        setHasStarted(true);
      }
    };
    checkToken();
  }, []);

  const login = () => {
    setHasStarted(true);
    setInitialAuthMode(null);
  };

  const logout = async () => {
    await removeStoredToken();
    queryClient.clear();
    setInitialAuthMode('login');
    setHasStarted(false);
  };

  const openLoginModal = () => {
    setInitialAuthMode('login');
    setHasStarted(false);
  };

  return (
    <AuthContext.Provider
      value={{
        hasStarted,
        initialAuthMode,
        setHasStarted,
        login,
        logout,
        openLoginModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
