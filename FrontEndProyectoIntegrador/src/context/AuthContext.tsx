import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { Usuario } from '../types';

const INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutos
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'] as const;

interface AuthContextValue {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  // null = verificando sesión, false = no autenticado, true = autenticado
  loading: boolean;
  logout: () => Promise<void>;
  setAuthenticated: (v: boolean, user?: Usuario | null) => void;
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
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Verificar sesión activa consultando el backend con la cookie HTTP-only.
    // Nunca leer localStorage para tokens.
    authService.fetchCurrentUser().then((user) => {
      if (user) {
        setUsuario(user);
        setIsAuthenticated(true);
        onAuthChange?.(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    });
  }, []);

  const setAuthenticated = useCallback((v: boolean, user?: Usuario | null) => {
    setIsAuthenticated(v);
    if (v) {
      setUsuario(user ?? authService.getCurrentUser());
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

  // Timer de inactividad: desloguea al usuario tras 20 min sin actividad
  useEffect(() => {
    if (!isAuthenticated) return;

    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT_MS);
    };

    resetTimer();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [isAuthenticated, logout]);

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
