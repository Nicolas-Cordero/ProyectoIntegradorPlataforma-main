/**
 * Custom hook para manejar autenticación de usuarios
 * Centraliza la lógica de autenticación y gestión de sesiones
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { logger } from '../config';

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

/**
 * Hook para gestionar autenticación de usuarios
 * @returns Objeto con estado de autenticación y métodos login/logout
 * 
 * @example
 * ```tsx
 * const { isAuthenticated, login, logout } = useAuth();
 * 
 * const handleLogin = async () => {
 *   const success = await login(username, password);
 *   if (success) navigate('/dashboard');
 * };
 * ```
 */
export const useAuth = (): UseAuthReturn => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Verificar autenticación al montar
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        // Aquí podrías obtener datos del usuario desde localStorage o API
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      logger.log('🔐 Intentando autenticación para:', username);
      const response = await authService.login({ email: username, password });
      
      if (response.accessToken && response.user) {
        setIsAuthenticated(true);
        setUser(response.user);
        logger.log('✅ Autenticación exitosa');
        return true;
      }
      
      logger.warn('⚠️ Autenticación fallida');
      return false;
    } catch (error) {
      logger.error('❌ Error en login:', error);
      return false;
    }
  };

  const logout = () => {
    logger.log('🚪 Cerrando sesión');
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
  };
};
