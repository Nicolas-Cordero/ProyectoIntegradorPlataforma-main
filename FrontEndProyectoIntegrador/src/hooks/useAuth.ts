import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { logger } from '../config';
import type { Usuario } from '../types';

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Usuario | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    authService.fetchCurrentUser().then((currentUser) => {
      if (currentUser) {
        setIsAuthenticated(true);
        setUser(currentUser);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      logger.log('🔐 Intentando autenticación para:', username);
      const { user: loggedUser } = await authService.login({ email: username, password });
      setIsAuthenticated(true);
      setUser(loggedUser);
      logger.log('✅ Autenticación exitosa');
      return true;
    } catch (error) {
      logger.error('❌ Error en login:', error);
      return false;
    }
  };

  const logout = async () => {
    logger.log('🚪 Cerrando sesión');
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  return { isAuthenticated, isLoading, user, login, logout };
};
