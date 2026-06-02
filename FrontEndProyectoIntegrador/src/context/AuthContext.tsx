import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { Usuario } from '../types';

interface AuthContextValue {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  setAuthenticated: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  onAuthChange?: (v: boolean) => void;
}

export function AuthProvider({ children, onAuthChange }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      const user = authService.getCurrentUser();
      setUsuario(user);
    }
    setLoading(false);
  }, []);

  const setAuthenticated = useCallback((v: boolean) => {
    setIsAuthenticated(v);
    if (v) {
      setUsuario(authService.getCurrentUser());
    } else {
      setUsuario(null);
    }
    onAuthChange?.(v);
  }, [onAuthChange]);

  const logout = useCallback(async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUsuario(null);
    onAuthChange?.(false);
  }, [onAuthChange]);

  return (
    <AuthContext.Provider value={{ usuario, isAuthenticated, loading, logout, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}
