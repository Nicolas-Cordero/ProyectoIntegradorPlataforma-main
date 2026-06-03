import { useParams, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { estudianteService, liceoService } from '../../services';
import PermissionService from '../../services/permissionService';
import { Navbar } from '../../components/common/Navbar';
import { useAuthContext } from '../../context/AuthContext';
import { BackgroundParticles } from '../../components/common/Particles';
import { Spinner, ErrorMessage } from '../../components/ui';
import { logger } from '../../config';
import type { Estudiante, Liceo, Generacion } from '../../types';
import marcoIzquierdo from '../../assets/frames/marco-izquierda.svg';
import marcoDerecho from '../../assets/frames/mardo-derecha.svg';

export interface EstudianteOutletContext {
  estudiante: Estudiante;
  liceo: Liceo | null;
  generacion: Generacion | null;
  canEdit: boolean;
  refresh: () => void;
}

const ESTADO_CHIP: Record<string, string> = {
  ACTIVO: 'bg-green-100 text-green-700',
  EGRESADO: 'bg-blue-100 text-blue-700',
  TITULADO: 'bg-blue-100 text-blue-700',
  RETIRADO: 'bg-red-100 text-red-700',
  ELIMINADO: 'bg-red-100 text-red-700',
  CONDICIONAL: 'bg-orange-100 text-orange-700',
  SUSPENDIDO: 'bg-yellow-100 text-yellow-700',
};

export default function EstudianteDetail() {
  const { id } = useParams<{ id: string }>();
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null);
  const [liceo, setLiceo] = useState<Liceo | null>(null);
  const [generacion, setGeneracion] = useState<Generacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const { usuario, logout } = useAuthContext();
  const navigate = useNavigate();

  const canEdit = PermissionService.canEditStudent(usuario);
  const refresh = useCallback(() => setRefreshCount((c) => c + 1), []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    estudianteService
      .getByIdComplete(id)
      .then(async (est) => {
        setEstudiante(est);

        // Cargar liceo y generacion por separado ya que el endpoint /complete no los incluye
        const generacionId = est.generacion_id ?? (est as any).generacion_id;
        const rbdLiceo = est.rbd_liceo;

        await Promise.allSettled([
          generacionId
            ? estudianteService.getGeneracionById(Number(generacionId))
                .then(setGeneracion)
                .catch(() => setGeneracion(null))
            : Promise.resolve(),
          rbdLiceo
            ? liceoService.getById(rbdLiceo)
                .then(setLiceo)
                .catch(() => setLiceo(null))
            : Promise.resolve(),
        ]);
      })
      .catch((err) => {
        logger.error('Error cargando estudiante:', err);
        setError('No se pudo cargar la información del estudiante');
      })
      .finally(() => setLoading(false));
  }, [id, refreshCount]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      logger.error('Error cerrando sesión:', err);
    }
  };

  if (!id) return null;

  const studentLinks = [
    { label: 'Perfil',               path: `/estudiante/${id}/perfil` },
    { label: 'Datos Personales',     path: `/estudiante/${id}/datos-personales` },
    { label: 'Información Familiar', path: `/estudiante/${id}/informacion-familiar` },
    { label: 'Desempeño Académico',  path: `/estudiante/${id}/desempeno-academico` },
    { label: 'Desempeño Semestral',  path: `/estudiante/${id}/desempeno-semestral` },
    { label: 'Avance Curricular',    path: `/estudiante/${id}/avance-curricular` },
    { label: 'Entrevistas',          path: `/estudiante/${id}/entrevistas` },
  ];

  if (loading) {
    return <Spinner fullScreen message="Cargando datos del estudiante..." />;
  }

  if (error || !estudiante) {
    return (
      <ErrorMessage
        fullScreen
        title="Error al cargar estudiante"
        message={error || 'No se pudo cargar la información del estudiante'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const chipClass = ESTADO_CHIP[estudiante.estado] ?? 'bg-gray-100 text-gray-700';

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#FFFBF0]">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <img src={marcoIzquierdo} alt="" className="absolute left-0 top-0 h-screen w-auto max-w-none opacity-35 select-none hidden md:block" />
        <img src={marcoDerecho}   alt="" className="absolute right-0 top-0 h-screen w-auto max-w-none opacity-35 select-none hidden md:block" />
      </div>

      <BackgroundParticles />

      <div className="relative z-10 flex flex-col flex-grow">
        <Navbar usuario={usuario} onLogout={handleLogout} links={studentLinks} />

        <div className="bg-white border-b border-gray-100 shadow-sm px-4 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
            <h1 className="text-lg font-bold text-gray-800">
              {estudiante.nombre} {estudiante.apellido}
            </h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${chipClass}`}>
              {estudiante.estado}
            </span>
          </div>
        </div>

        <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet context={{ estudiante, liceo, generacion, canEdit, refresh } satisfies EstudianteOutletContext} />
        </main>
      </div>
    </div>
  );
}
