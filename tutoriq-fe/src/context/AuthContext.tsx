import React, { createContext, useContext } from 'react';
import { useSimpleAuth, UseSimpleAuthReturn } from '../hooks/useSimpleAuth';

const AuthContext = createContext<UseSimpleAuthReturn | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useSimpleAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth(): UseSimpleAuthReturn {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
