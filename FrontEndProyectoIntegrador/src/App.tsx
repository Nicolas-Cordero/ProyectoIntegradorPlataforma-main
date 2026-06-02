import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { authService } from './services/authService';
import { logger } from './config';
import { LoginAdminForm } from './components/features/auth/login/LoginAdminForm';
import { Spinner } from './components/ui';
import { MainLayout } from './components/common/MainLayout';
import { AuthProvider, useAuthContext } from './context/AuthContext';

const EstudiantesSection = lazy(() => import('./pages/EstudiantesSection').then(m => ({ default: m.EstudiantesSection })));
const GeneracionView = lazy(() => import('./pages/GeneracionView'));
const EstudianteDetail = lazy(() => import('./pages/EstudianteDetail'));
const EntrevistaWorkspace = lazy(() => import('./pages/EntrevistaWorkspace').then(m => ({ default: m.EntrevistaWorkspace })));
const UserProfile = lazy(() => import('./pages/UserProfile').then(m => ({ default: m.UserProfile })));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const DebugPermissions = lazy(() => import('./pages/DebugPermissions'));
const GeneracionesPanel = lazy(() => import('./pages/GeneracionesPanel').then(m => ({ default: m.GeneracionesPanel })));
const EstadisticasPage  = lazy(() => import('./pages/EstadisticasPage').then(m => ({ default: m.EstadisticasPage })));


function AppRoutes() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuthContext();

  const isAdmin = usuario?.rol === 'ADMIN';

  const NAV_LINKS = [
    { label: 'Estudiantes', path: '/estudiantes' },
    { label: 'Generaciones', path: '/generaciones' },
    { label: 'Estadisticas', path: '/estadisticas' },
    { label: 'Perfil', path: '/perfil' },
    ...(isAdmin ? [{ label: 'Gestion Usuarios', path: '/admin/usuarios' }] : []),
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      logger.error('❌ Error al cerrar sesión:', error);
    }
  };

  const withLayout = (children: React.ReactNode) => (
    <MainLayout usuario={usuario} onLogout={handleLogout} links={NAV_LINKS}>
      {children}
    </MainLayout>
  );

  return (
    <Routes>
      <Route path="/estudiantes" element={withLayout(<EstudiantesSection />)} />
      <Route path="/perfil" element={withLayout(<UserProfile />)} />
      <Route path="/generaciones" element={withLayout(<GeneracionesPanel />)} />
      <Route path="/generacion/:id" element={withLayout(<GeneracionView />)} />
      <Route path="/estudiante/:id" element={<EstudianteDetail />} />
      <Route path="/entrevista/:id" element={<EntrevistaWorkspace />} />
      <Route path="/estadisticas"   element={withLayout(<EstadisticasPage />)} />
      <Route path="/admin/usuarios" element={withLayout(<UserManagement />)} />
      <Route path="/debug-permissions" element={<DebugPermissions />} />
    </Routes>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    logger.log('🔐 Estado de autenticación:', authenticated);
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  }, []);

  const handleAuthChange = (authenticated: boolean) => {
    logger.log('🔄 Cambiando estado de autenticación a:', authenticated);
    setIsAuthenticated(authenticated);
  };

  if (isLoading) {
    return <Spinner fullScreen message="Verificando autenticación..." />;
  }

  return (
    <Router>
      <AuthProvider onAuthChange={handleAuthChange}>
        <Suspense fallback={<Spinner fullScreen message="Cargando página..." />}>
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ?
                  <Navigate to="/estudiantes" replace /> :
                  <LoginAdminForm onAuthChange={handleAuthChange} />
              }
            />
            <Route
              path="/*"
              element={
                isAuthenticated ?
                  <AppRoutes /> :
                  <Navigate to="/" replace />
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
