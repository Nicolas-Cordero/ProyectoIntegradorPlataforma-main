﻿import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, estadisticasService } from '../services';
import { estudianteService } from '../services';
import { logger } from '../config';
import { Spinner, ErrorMessage, StatCard } from '../components/ui';
import logoFundacionFooter from '../assets/logos/logo-fundacion.png';
import marcoIzquierdo from '../assets/frames/marco-izquierda.svg';
import marcoDerecho from '../assets/frames/mardo-derecha.svg';
import booksIcon from '../assets/icons/books.ico';
import studentsIcon from '../assets/icons/students.ico';
import activeStudentIcon from '../assets/icons/active-student.ico';
import { DashboardParticles } from '../components/features/dashboard/DashboardParticles';
import { 
  DashboardNavbar,
  CreateGeneracionModal,
  CreateEstudianteModal,
  GenerationsGrid
} from '../components/features/dashboard';
import type { Estudiante, EstadisticasAdmin } from '../types';
import { Box, Tabs, Tab } from '@mui/material';
import { UserProfile } from './UserProfile';
import { UserManagement } from './UserManagement';
import { EstudiantesSection } from './EstudiantesSection';

interface DashboardProps {
  onAuthChange?: (authenticated: boolean) => void;
}

interface GeneracionCalculada {
  año: number;
  estudiantes: number;
  activos: number;
  estado: 'activa' | 'finalizada';
  estudiantesData: Estudiante[];
}

export const Dashboard: React.FC<DashboardProps> = ({ onAuthChange }) => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'activas' | 'finalizadas'>('todas');
  const [ordenarPor, setOrdenarPor] = useState<'año' | 'estudiantes'>('año');

  const [estadisticas, setEstadisticas] = useState<EstadisticasAdmin | null>(null);
  const [generaciones, setGeneraciones] = useState<GeneracionCalculada[]>([]);
  const [generacionesCreadas, setGeneracionesCreadas] = useState<number[]>([]);
  const [allStudents, setAllStudents] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para modales
  const [openCreateGeneracion, setOpenCreateGeneracion] = useState(false);
  const [openCreateEstudiante, setOpenCreateEstudiante] = useState(false);
  const [selectedGeneracion, setSelectedGeneracion] = useState<number | null>(null);

  // Estado para la tab activa
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Cargar generaciones creadas del localStorage
    let generacionesGuardadas: number[] = [];
    const generacionesJSON = localStorage.getItem('generaciones_creadas');
    if (generacionesJSON) {
      try {
        generacionesGuardadas = JSON.parse(generacionesJSON);
        setGeneracionesCreadas(generacionesGuardadas);
      } catch (error) {
        console.error('Error al cargar generaciones del localStorage:', error);
      }
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const user = await authService.getCurrentUser();
        setUsuario(user);

        try {
          logger.log('📊 Cargando datos del backend...');

          const [estudiantesData, estadisticasData] = await Promise.all([
            estudianteService.getAll(),
            estadisticasService.getDashboard()
          ]);
          setEstadisticas(estadisticasData);
          setAllStudents(estudiantesData);
          
          console.log('📊 Estudiantes cargados del backend:', {
            total: estudiantesData.length,
            estudiantes: estudiantesData.map(e => ({
              nombre: e.nombre,
              año: e.institucion?.anio_de_ingreso || e.año_generacion || e.año_ingreso || '2024'
            }))
          });
          
          // Pasar las generaciones guardadas del localStorage al calcular
          const generacionesCalculadas = calcularGeneracionesDesdeEstudiantes(estudiantesData, generacionesGuardadas);
          setGeneraciones(generacionesCalculadas);

          logger.log('✅ Datos del backend cargados exitosamente');

        } catch (apiError) {
          logger.error('❌ Error al cargar datos del backend:', apiError);
          setError('No se pudo conectar con el backend. Verifica que esté corriendo.');
          setGeneraciones([]);
        }

      } catch (error) {
        logger.error('Error al cargar datos:', error);
        setError('Error al cargar los datos del dashboard');
        setGeneraciones([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Efecto para recalcular generaciones cuando cambias generacionesCreadas
  useEffect(() => {
    if (generaciones.length > 0 && generacionesCreadas.length > 0) {
      console.log('🔄 Recalculando generaciones por cambio en generacionesCreadas:', generacionesCreadas);
      const todosLosEstudiantes = generaciones.flatMap(g => g.estudiantesData);
      const generacionesActualizadas = calcularGeneracionesDesdeEstudiantes(todosLosEstudiantes, generacionesCreadas);
      setGeneraciones(generacionesActualizadas);
    }
  }, [generacionesCreadas]);

  const calcularGeneracionesDesdeEstudiantes = (
    estudiantesData: Estudiante[],
    generacionesCreadasParam?: number[]
  ): GeneracionCalculada[] => {
    console.log('🔢 Calculando generaciones desde', estudiantesData.length, 'estudiantes');
    
    const estudiantesPorAño = estudiantesData.reduce((acc, estudiante) => {
      // Debug: mostrar todos los campos disponibles del estudiante
      console.log(`🔍 Debug estudiante ${estudiante.nombre}:`, {
        'institucion?.anio_de_ingreso': estudiante.institucion?.anio_de_ingreso,
        'año_generacion': estudiante.año_generacion,
        'año_ingreso': estudiante.año_ingreso,
        'informacionAcademica?.año_ingreso_beca': estudiante.informacionAcademica?.año_ingreso_beca,
        'institucion completa': estudiante.institucion,
        'informacionAcademica completa': estudiante.informacionAcademica
      });

      // Buscar el año de ingreso en múltiples campos posibles
      const posiblesAños = [
        estudiante.institucion?.anio_de_ingreso,
        estudiante.año_generacion,
        estudiante.año_ingreso,
        estudiante.informacionAcademica?.año_ingreso_beca,
        (estudiante.institucion as any)?.año_ingreso,
        (estudiante as any).generacion,
        (estudiante as any).año_generacion,
        (estudiante as any).anio_ingreso,
        // Buscar también en propiedades que podrían ser strings
        parseInt((estudiante as any).generacion),
        parseInt((estudiante.institucion as any)?.anio_ingreso),
      ];
      
      // Encontrar el primer valor válido
      const año = posiblesAños.find(valor => {
        const parsed = parseInt(valor as string);
        return !isNaN(parsed) && parsed > 1990 && parsed <= 2030;
      }) || '2024';

      const añoNum = parseInt(año.toString());
      console.log(`👤 Estudiante ${estudiante.nombre} asignado a generación ${añoNum} (valor original: ${año})`);

      if (!acc[añoNum]) {
        acc[añoNum] = [];
      }
      acc[añoNum].push(estudiante);
      return acc;
    }, {} as Record<number, Estudiante[]>);

    // Incluir generaciones creadas manualmente que no tienen estudiantes (generaciones vacías)
    const generacionesAIncluir = generacionesCreadasParam || generacionesCreadas;
    generacionesAIncluir.forEach(año => {
      if (!estudiantesPorAño[año]) {
        console.log(`📝 Agregando generación vacía creada manualmente: ${año}`);
        estudiantesPorAño[año] = [];
      }
    });

    const generacionesCalculadas = Object.entries(estudiantesPorAño)
      .map(([año, estudiantesAño]) => {
        const añoNum = parseInt(año);

        const activos = estudiantesAño.filter(e =>
          e.estado === 'Activo' ||
          !e.estado
        ).length;

        // Una generación está activa si tiene estudiantes activos, independientemente del año
        const estaActiva = activos > 0;
        
        console.log(`📊 Generación ${añoNum}: ${estudiantesAño.length} total, ${activos} activos → ${estaActiva ? 'ACTIVA' : 'FINALIZADA'}`);

        return {
          año: añoNum,
          estudiantes: estudiantesAño.length,
          activos,
          estado: estaActiva ? 'activa' : 'finalizada' as 'activa' | 'finalizada',
          estudiantesData: estudiantesAño
        };
      })
      .sort((a, b) => b.año - a.año);

    console.log('✅ Generaciones calculadas:', generacionesCalculadas.map(g => `${g.año}: ${g.estudiantes} estudiantes`));
    return generacionesCalculadas;
  };

  const handleLogout = async () => {
    try {
      await authService.logout();

      if (onAuthChange) {
        onAuthChange(false);
      }

      navigate('/');
    } catch (error) {
      logger.error('❌ Error al cerrar sesión:', error);
    }
  };

  const handleCreateGeneracion = (año: number) => {
    // Verificar si la generación ya existe
    const yaExiste = generaciones.some(g => g.año === año) || generacionesCreadas.includes(año);
    
    if (!yaExiste) {
      // Agregar la nueva generación a las creadas
      const nuevasGeneraciones = [...generacionesCreadas, año];
      setGeneracionesCreadas(nuevasGeneraciones);
      
      // Guardar en localStorage
      localStorage.setItem('generaciones_creadas', JSON.stringify(nuevasGeneraciones));
      
      console.log(`✅ Generación ${año} creada y guardada`);
      
      // Recalcular generaciones pasando las NUEVAS generaciones creadas
      const todosLosEstudiantes = generaciones.flatMap(g => g.estudiantesData);
      const generacionesActualizadas = calcularGeneracionesDesdeEstudiantes(todosLosEstudiantes, nuevasGeneraciones);
      setGeneraciones(generacionesActualizadas);
    }
    
    // Navegar a la vista de la generación recién creada
    navigate(`/generacion/${año}`);
  };

  const handleAddEstudianteToGeneracion = (año: number) => {
    setSelectedGeneracion(año);
    setOpenCreateEstudiante(true);
  };

  const handleEstudianteCreated = async () => {
    // Recargar datos después de crear estudiante
    console.log('🔄 Recargando datos del dashboard después de crear estudiante...');
    setLoading(true);
    try {
      const [estudiantesData, estadisticasData] = await Promise.all([
        estudianteService.getAll(),
        estadisticasService.getDashboard()
      ]);
      setEstadisticas(estadisticasData);
      setAllStudents(estudiantesData);
      
      // Agregar automáticamente a generaciones creadas cualquier generación nueva que aparezca en los estudiantes
      const generatecionesDesdeEstudiantes = estudiantesData
        .reduce((acc, est) => {
          const año = est.institucion?.anio_de_ingreso ||
            est.año_generacion ||
            est.año_ingreso ||
            est.informacionAcademica?.año_ingreso_beca ||
            2024;
          const añoNum = parseInt(año.toString());
          if (añoNum > 1990 && añoNum <= 2030 && !acc.includes(añoNum)) {
            acc.push(añoNum);
          }
          return acc;
        }, [] as number[]);
      
      const nuevasGeneracionesDetectadas = generatecionesDesdeEstudiantes
        .filter(año => !generacionesCreadas.includes(año));
      
      const todasLasGeneracionesActualizadas = nuevasGeneracionesDetectadas.length > 0
        ? [...new Set([...generacionesCreadas, ...nuevasGeneracionesDetectadas])]
        : generacionesCreadas;
      
      if (nuevasGeneracionesDetectadas.length > 0) {
        console.log('🆕 Detectadas nuevas generaciones con estudiantes:', nuevasGeneracionesDetectadas);
        setGeneracionesCreadas(todasLasGeneracionesActualizadas);
        localStorage.setItem('generaciones_creadas', JSON.stringify(todasLasGeneracionesActualizadas));
      }
      
      // Recalcular generaciones usando las generaciones creadas actualizadas
      const generacionesCalculadas = calcularGeneracionesDesdeEstudiantes(estudiantesData, todasLasGeneracionesActualizadas);
      setGeneraciones(generacionesCalculadas);
      
      console.log('✅ Dashboard actualizado - Nuevos datos:', {
        totalEstudiantes: estudiantesData.length,
        generaciones: generacionesCalculadas.length,
        generacionesCreadas: todasLasGeneracionesActualizadas.length,
        ultimoEstudiante: estudiantesData[estudiantesData.length - 1]
      });
      logger.log('✅ Datos actualizados exitosamente');
    } catch (error) {
      logger.error('Error al recargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const generacionesFiltradas = generaciones.filter(generacion => {
    const coincideBusqueda = busqueda === '' ||
      generacion.año.toString().includes(busqueda);

    const coincideEstado = filtroEstado === 'todas' ||
      (filtroEstado === 'activas' && generacion.estado === 'activa') ||
      (filtroEstado === 'finalizadas' && generacion.estado === 'finalizada');

    return coincideBusqueda && coincideEstado;
  });

  const generacionesOrdenadas = [...generacionesFiltradas].sort((a, b) => {
    if (ordenarPor === 'año') {
      return b.año - a.año;
    } else {
      return b.estudiantes - a.estudiantes;
    }
  });

  const totalEstudiantes = estadisticas?.total_estudiantes ||
    generacionesOrdenadas.reduce((sum, gen) => sum + gen.estudiantes, 0);
  const totalActivos = generacionesOrdenadas.reduce((sum, gen) => sum + gen.activos, 0);

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('todas');
    setOrdenarPor('año');
  };

  if (loading) {
    return <Spinner fullScreen message="Cargando Dashboard..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        fullScreen 
        message={error} 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: '#FFFBF0' }}>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <img
          src={marcoIzquierdo}
          alt=""
          className="absolute left-0 top-0 h-screen w-auto max-w-none opacity-35 select-none hidden md:block"
        />
        <img
          src={marcoDerecho}
          alt=""
          className="absolute right-0 top-0 h-screen w-auto max-w-none opacity-35 select-none hidden md:block"
        />
      </div>

      <DashboardParticles />

      <DashboardNavbar usuario={usuario} onLogout={handleLogout} />

      {/* Barra de Navegación con Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white', display: 'flex', justifyContent: 'center' }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            px: 3,
            display: 'flex',
            justifyContent: { xs: 'flex-start', md: 'center' },
            '& .MuiTab-root': {
              minWidth: 120,
              fontWeight: 500,
              textTransform: 'none'
            }
          }}
        >
          <Tab label="Estudiantes" />
          <Tab label="Generaciones" />
          {usuario?.role === 'admin' && <Tab label="Gestión de Usuarios" />}
          <Tab label="Estadísticas Generales" />
          <Tab label="Perfil" />
        </Tabs>
      </Box>

      {/* Contenido Principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8 flex-1 w-full">

        {/* Tab 0: Estudiantes */}
        {activeTab === 0 && (
          <EstudiantesSection />
        )}

        {/* Tab 1: Generaciones */}
        {activeTab === 1 && (
          <GenerationsGrid
            generaciones={generacionesOrdenadas}
            onAddEstudiante={handleAddEstudianteToGeneracion}
            onCreateGeneracion={() => setOpenCreateGeneracion(true)}
          />
        )}

        {/* Tab 2: Gestión de Usuarios (solo admin) */}
        {activeTab === 2 && usuario?.role === 'admin' && (
          <UserManagement />
        )}

        {/* Tab 3 o 2 (si no admin): Estadísticas Generales */}
        {((usuario?.role === 'admin' && activeTab === 3) || (usuario?.role !== 'admin' && activeTab === 2)) && (
          <>
            {/* Estadísticas + Filtros Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Columna Izquierda: Stat Cards Apiladas */}
              <div className="flex flex-col gap-4">
                <StatCard 
                  icon={booksIcon}
                  label="Total Generaciones" 
                  value={generaciones.length}
                  accentColor="#d55e48"
                  onClick={() => setActiveTab(1)}
                  typingStartDelayMs={51}
                />
                <StatCard 
                  icon={studentsIcon}
                  label="Total Estudiantes" 
                  value={totalEstudiantes}
                  accentColor="#f9b150"
                  onClick={() => setActiveTab(0)}
                  typingStartDelayMs={60}
                />
                <StatCard 
                  icon={activeStudentIcon}
                  label="Estudiantes Activos" 
                  value={totalActivos}
                  accentColor="#43b59a"
                  onClick={() => setActiveTab(0)}
                  typingStartDelayMs={69}
                />
              </div>
            </div>
          </>
        )}

        {/* Tab 4 o 3 (si no admin): Perfil */}
        {((usuario?.role === 'admin' && activeTab === 4) || (usuario?.role !== 'admin' && activeTab === 3)) && (
          <UserProfile />
        )}
      </div>

      <footer
        className="relative z-10"
        style={{
          backgroundColor: '#1f1f1f',
          color: '#f5f5f5',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <a
              href="https://fundacioncarmengoudie.cl/"
              target="_self"
              rel="noreferrer"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <img
                src={logoFundacionFooter}
                alt="Fundación Carmen Goudie"
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
              />
              <span className="font-medium">Fundación Carmen Goudie</span>
            </a>

            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-4 text-center sm:text-right text-xs sm:text-sm text-gray-300">
              <span>© Fundación Carmen Goudie - 2026. Todos los derechos reservados.</span>
              <span>© BrainStack</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modales */}
      <CreateGeneracionModal
        open={openCreateGeneracion}
        onClose={() => setOpenCreateGeneracion(false)}
        onSuccess={handleCreateGeneracion}
      />

      {selectedGeneracion && (
        <CreateEstudianteModal
          open={openCreateEstudiante}
          onClose={() => {
            setOpenCreateEstudiante(false);
            setSelectedGeneracion(null);
          }}
          onSuccess={handleEstudianteCreated}
          generacion={selectedGeneracion}
        />
      )}
    </div>
  );
};