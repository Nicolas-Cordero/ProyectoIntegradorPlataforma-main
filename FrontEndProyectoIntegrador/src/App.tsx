import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { logger } from './config';
import { LoginAdminForm } from './components/features/auth/login/LoginAdminForm';
import { Spinner } from './components/ui';
import { MainLayout } from './components/common/MainLayout';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { PasswordChangeModal } from './components/features/auth/password-recovery';

const EstudiantesSection = lazy(() => import('./pages/EstudiantesSection').then(m => ({ default: m.EstudiantesSection })));
const GeneracionView = lazy(() => import('./pages/GeneracionSection/GeneracionView'));
const EstudianteDetail = lazy(() => import('./pages/EstudianteSection/EstudianteDetail'));
const EstudiantePerfil = lazy(() => import('./pages/EstudianteSection/EstudiantePerfil'));
const EstudianteDatosPersonales = lazy(() => import('./pages/EstudianteSection/EstudianteDatosPersonales'));
const EstudianteInfoFamiliar = lazy(() => import('./pages/EstudianteSection/EstudianteInfoFamiliar'));
const EstudianteDesempenoAcademico = lazy(() => import('./pages/EstudianteSection/EstudianteDesempenoAcademico'));
const EstudianteDesempenoSemestral = lazy(() => import('./pages/EstudianteSection/EstudianteDesempenoSemestral'));
const EstudianteAvanceCurricular = lazy(() => import('./pages/EstudianteSection/EstudianteAvanceCurricular'));
const EstudianteEntrevistas = lazy(() => import('./pages/EstudianteSection/EstudianteEntrevistas'));
const EntrevistaWorkspace = lazy(() => import('./pages/EstudianteSection/EntrevistaWorkspace').then(m => ({ default: m.EntrevistaWorkspace })));
const UserProfile = lazy(() => import('./pages/UserProfile').then(m => ({ default: m.UserProfile })));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const DebugPermissions = lazy(() => import('./pages/DebugPermissions'));
const GeneracionesPanel = lazy(() => import('./pages/GeneracionesPanel').then(m => ({ default: m.GeneracionesPanel })));
const EstadisticasPage  = lazy(() => import('./pages/EstadisticasPage').then(m => ({ default: m.EstadisticasPage })));
const AcuerdoCompromiso = lazy(() => import('./pages/AcuerdoCompromiso').then(m => ({ default: m.AcuerdoCompromiso })));


function AppRoutes() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuthContext();

  const isAdmin = usuario?.rol === 'ADMIN';

  const NAV_LINKS = [
    { label: 'Estudiantes', path: '/estudiantes' },
    { label: 'Generaciones', path: '/generaciones' },
    { label: 'Estadisticas', path: '/estadisticas' },
    { label: 'Perfil', path: '/perfil' },
    ...(isAdmin ? [
      { label: 'Gestion Usuarios', path: '/admin/usuarios' },
      { label: 'Acuerdo de Compromiso', path: '/admin/acuerdo-compromiso' },
    ] : []),
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
      <Route path="/estudiante/:id" element={<EstudianteDetail />}>
        <Route index element={<Navigate to="perfil" replace />} />
        <Route path="perfil" element={<EstudiantePerfil />} />
        <Route path="datos-personales" element={<EstudianteDatosPersonales />} />
        <Route path="informacion-familiar" element={<EstudianteInfoFamiliar />} />
        <Route path="desempeno-academico" element={<EstudianteDesempenoAcademico />} />
        <Route path="desempeno-semestral" element={<EstudianteDesempenoSemestral />} />
        <Route path="avance-curricular" element={<EstudianteAvanceCurricular />} />
        <Route path="entrevistas" element={<EstudianteEntrevistas />} />
      </Route>
      <Route path="/entrevista/:id" element={<EntrevistaWorkspace />} />
      <Route path="/estadisticas"   element={withLayout(<EstadisticasPage />)} />
      <Route path="/admin/usuarios" element={withLayout(<UserManagement />)} />
      <Route path="/admin/acuerdo-compromiso" element={withLayout(<AcuerdoCompromiso />)} />
      <Route path="/debug-permissions" element={<DebugPermissions />} />
    </Routes>
  );
}

function AppShell() {
  const { isAuthenticated, loading, setAuthenticated, usuario } = useAuthContext();

  // Bloquear render hasta que se resuelva la verificación de sesión.
  // Esto corrige el flash de rutas protegidas antes de que el estado de auth se resuelva.
  if (loading) {
    return <Spinner fullScreen message="Verificando autenticación..." />;
  }

  return (
    <>
      <Suspense fallback={<Spinner fullScreen message="Cargando página..." />}>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated
                ? <Navigate to="/estudiantes" replace />
                : <LoginAdminForm onAuthChange={(v) => setAuthenticated(v)} />
            }
          />
          <Route
            path="/*"
            element={
              isAuthenticated
                ? <AppRoutes />
                : <Navigate to="/" replace />
            }
          />
        </Routes>
      </Suspense>

      {/* Cambio de contraseña obligatorio en el primer ingreso: bloquea la app
          hasta que el usuario cambie su contraseña inicial (RUT sin dígito verificador). */}
      {isAuthenticated && usuario?.must_change_password && (
        <PasswordChangeModal
          abierto
          forzado
          requireCurrentPassword
          userId={usuario.rut_usuario}
          onCerrar={() => {}}
          onSuccess={() => setAuthenticated(true, { ...usuario, must_change_password: false })}
        />
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </Router>
  );
}

export default App;
