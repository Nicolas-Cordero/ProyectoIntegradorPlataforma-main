import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';
import { logger } from './config';
import { LoginAdminForm } from './components/features/auth/login/LoginAdminForm';
import { SolicitarRecuperacion, VerificarCodigo, NuevaPassword } from './components/features/auth/password-recovery';
import { LoadingSpinner } from './components/ui';

// Lazy loading de componentes pesados para mejor rendimiento
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const GeneracionView = lazy(() => import('./pages/GeneracionView'));
const EstudianteDetail = lazy(() => import('./pages/EstudianteDetail'));
const EntrevistaWorkspace = lazy(() => import('./pages/EntrevistaWorkspace').then(m => ({ default: m.EntrevistaWorkspace })));
const UserProfile = lazy(() => import('./pages/UserProfile').then(m => ({ default: m.UserProfile })));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const DebugPermissions = lazy(() => import('./pages/DebugPermissions'));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticación al cargar la app
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      logger.log('🔐 Estado de autenticación:', authenticated);
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Función para actualizar el estado de autenticación
  const handleAuthChange = (authenticated: boolean) => {
    logger.log('🔄 Cambiando estado de autenticación a:', authenticated);
    setIsAuthenticated(authenticated);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Verificando autenticación..." />;
  }

  return (
    <Router>
      <Suspense fallback={<LoadingSpinner fullScreen message="Cargando página..." />}>
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <LoginAdminForm onAuthChange={handleAuthChange} />
            }
          />
          <Route 
            path="/solicitar-recuperacion" 
            element={<SolicitarRecuperacion />}
          />
          <Route 
            path="/verificar-codigo" 
            element={<VerificarCodigo />}
          />
          <Route 
            path="/nueva-password" 
            element={<NuevaPassword />}
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
                <Dashboard onAuthChange={handleAuthChange} /> : 
                <Navigate to="/" replace />
            }
          />
          <Route 
            path="/generacion/:id" 
            element={
              isAuthenticated ? 
                <GeneracionView /> : 
                <Navigate to="/" replace />
            }
          />
          <Route 
            path="/estudiante/:id" 
            element={
              isAuthenticated ? 
                <EstudianteDetail /> : 
                <Navigate to="/" replace />
            }
          />
          <Route 
            path="/entrevista/:id" 
            element={
              isAuthenticated ? 
                <EntrevistaWorkspace /> : 
                <Navigate to="/" replace />
            }
          />
          <Route 
            path="/perfil" 
            element={
              isAuthenticated ? 
                <UserProfile /> : 
                <Navigate to="/" replace />
            }
          />
          <Route 
            path="/admin/usuarios" 
            element={
              isAuthenticated ? 
                <UserManagement /> : 
                <Navigate to="/" replace />
            }
          />
          <Route 
            path="/debug-permissions" 
            element={
              isAuthenticated ? 
                <DebugPermissions /> : 
                <Navigate to="/" replace />
            }
          />
          <Route 
            path="/test" 
            element={
              <div className="min-h-screen bg-[var(--color-turquoise)] p-8 text-black">
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
                  <h1 className="text-3xl font-bold mb-4">🔧 Página de Debug</h1>
                  <h2 className="text-xl font-semibold mb-3">Estado actual:</h2>
                  <ul className="space-y-2 mb-6 text-sm">
                    <li className="p-2 bg-gray-100 rounded">
                      <strong>Token:</strong> {localStorage.getItem('token') || '❌ No existe'}
                    </li>
                    <li className="p-2 bg-gray-100 rounded">
                      <strong>Usuario:</strong> {localStorage.getItem('user') || '❌ No existe'}
                    </li>
                    <li className="p-2 bg-gray-100 rounded">
                      <strong>Autenticado:</strong> {isAuthenticated ? '✅ SÍ' : '❌ NO'}
                    </li>
                  </ul>
                  <button 
                    onClick={() => {
                      localStorage.clear();
                      setIsAuthenticated(false);
                      window.location.href = '/';
                    }}
                    className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    aria-label="Limpiar almacenamiento local y volver al login"
                  >
                    🗑️ Limpiar localStorage y ir al login
                  </button>
                </div>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;