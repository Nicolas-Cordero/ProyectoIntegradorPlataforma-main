import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  estudianteService,
  entrevistaService,
  historialAcademicoService,
  ramosCursadosService,
} from '../services';
import { logger } from '../config';
import { GenerationHeader, StudentFilterPanel, StudentsTable } from '../components/features/generation-view';
import { CreateEstudianteModal, DashboardNavbar } from '../components/features/dashboard';
import { daysSince } from '../utils/dateHelpers';
import type { Estudiante } from '../types';
import { Box, AppBar, Toolbar, Button, Chip, useMediaQuery, useTheme } from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { TypingText } from '../components/common/TypingText';
import { useConfirmDialog } from '../components/ui';
import { DashboardParticles } from '../components/common/Particles';
import logoFundacion from '../assets/logos/logo.svg';
import marcoIzquierdo from '../assets/frames/marco-izquierda.svg';
import marcoDerecho from '../assets/frames/mardo-derecha.svg';
import { authService } from '../services';

export type UIStudent = Estudiante & {
  ultimaEntrevista?: string;
  totalEntrevistasAno?: number;
  diasSinEntrevista?: number;
  tienePendienteNotas?: boolean;
};

export default function GeneracionViewSimple(){
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [usuario, setUsuario] = useState<any>(null);
  const showAdminChip = useMediaQuery(theme.breakpoints.up('lg'));
  const generationId = parseInt(id || '2024', 10);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCarrera, setFilterCarrera] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [sortField, setSortField] = useState<keyof UIStudent>('apellidos');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [students, setStudents] = useState<UIStudent[]>([]);
  const [openCreateEstudiante, setOpenCreateEstudiante] = useState(false);
  const { showConfirm, ConfirmDialog } = useConfirmDialog();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const normalizeNumber = (value?: number | string | null) => {
    if (value === null || value === undefined) return undefined;

    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;

    const cleaned = String(value).replace(',', '.').trim();
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : undefined;
  };

  const calculatePromedio = (
    student: Estudiante,
    historiales: any[],
    ramos: any[]
  ): number | undefined => {
    const directo =
      normalizeNumber(student.promedio) ??
      normalizeNumber(student.informacionAcademica?.promedio_acumulado) ??
      normalizeNumber(student.informacionAcademica?.promedio_1);

    if (directo !== undefined) return directo;

    const historialesConPromedio = historiales.filter(
      (h) => normalizeNumber(h?.promedio_semestre) !== undefined
    );
    if (historialesConPromedio.length > 0) {
      const suma = historialesConPromedio.reduce(
        (acc, h) => acc + (normalizeNumber(h.promedio_semestre) || 0),
        0
      );
      const promedio = suma / historialesConPromedio.length;
      if (Number.isFinite(promedio)) return promedio;
    }

    const ramosConNota = ramos.filter(
      (r) => normalizeNumber(r?.promedio_final) !== undefined
    );
    if (ramosConNota.length > 0) {
      const suma = ramosConNota.reduce(
        (acc, r) => acc + (normalizeNumber(r.promedio_final) || 0),
        0
      );
      const promedio = suma / ramosConNota.length;
      if (Number.isFinite(promedio)) return promedio;
    }

    return undefined;
  };

  const enrichStudentsWithStats = useCallback(async (rawStudents: Estudiante[]): Promise<UIStudent[]> => {
    const currentYear = new Date().getFullYear();

    return Promise.all(
      rawStudents.map(async (student) => {
        const studentId = String((student as any).id_estudiante || student.id || '');

        if (!studentId) {
          return {
            ...student,
            promedio: normalizeNumber(student.promedio),
            totalEntrevistasAno: 0,
          };
        }

        const [entrevistas, historiales, ramos] = await Promise.all([
          entrevistaService.getByEstudiante(studentId).catch((error) => {
            logger.warn('⚠️ No se pudieron cargar entrevistas del estudiante', { studentId, error });
            return [];
          }),
          student.historialesAcademicos && student.historialesAcademicos.length > 0
            ? Promise.resolve(student.historialesAcademicos)
            : historialAcademicoService.getByEstudiante(studentId).catch((error) => {
                logger.warn('⚠️ No se pudo cargar historial académico del estudiante', { studentId, error });
                return [];
              }),
          student.ramosCursados && student.ramosCursados.length > 0
            ? Promise.resolve(student.ramosCursados)
            : ramosCursadosService.getByEstudiante(studentId).catch((error) => {
                logger.warn('⚠️ No se pudieron cargar ramos cursados del estudiante', { studentId, error });
                return [];
              }),
        ]);

        const entrevistasList = Array.isArray(entrevistas) ? entrevistas : [];
        const historialesList = Array.isArray(historiales) ? historiales : historiales ? [historiales] : [];
        const ramosList = Array.isArray(ramos) ? ramos : [];

        const ultimaEntrevistaDate = entrevistasList
          .map((entrevista) => (entrevista?.fecha ? new Date(entrevista.fecha) : undefined))
          .filter((fecha): fecha is Date => Boolean(fecha))
          .sort((a, b) => b.getTime() - a.getTime())[0];

        const ultimaEntrevista = ultimaEntrevistaDate ? ultimaEntrevistaDate.toISOString() : undefined;
        const totalEntrevistasAno = entrevistasList.filter((entrevista) => {
          const fecha = entrevista?.fecha ? new Date(entrevista.fecha) : undefined;
          return fecha?.getFullYear() === currentYear;
        }).length;
        const diasSinEntrevista = ultimaEntrevista ? daysSince(ultimaEntrevista) : undefined;

        const promedioCalculado = calculatePromedio(student, historialesList, ramosList);
        const tienePendienteNotas = ramosList.some(
          (ramo) => normalizeNumber(ramo?.promedio_final) === undefined
        );

        return {
          ...student,
          promedio: promedioCalculado ?? normalizeNumber(student.promedio),
          ultimaEntrevista,
          totalEntrevistasAno,
          diasSinEntrevista,
          tienePendienteNotas,
        };
      })
    );
  }, []);
  
  // Obtener opciones únicas para los filtros
  const carreras = [...new Set(students.map(student => 
    student.carrera || student.institucion?.carrera_especialidad || 'Sin carrera'
  ).filter(Boolean))];
  const estados = [...new Set(students.map(student => 
    student.estado || 'Activo'
  ))];

  // Filtrar y ordenar estudiantes
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter(student => {
      const nombre = student.nombre || student.nombres || '';
      const apellido = student.apellidos || '';
      const rut = student.rut || '';
      const carrera = student.carrera || student.institucion?.carrera_especialidad || '';
      const estado = student.estado || 'Activo';
      
      const matchesSearch = 
        nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rut.includes(searchTerm);
      
      const matchesCarrera = !filterCarrera || carrera === filterCarrera;
      const matchesEstado = !filterEstado || estado === filterEstado;
      
      return matchesSearch && matchesCarrera && matchesEstado;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (aValue === undefined || aValue === null) aValue = '' as any;
      if (bValue === undefined || bValue === null) bValue = '' as any;

      const aVal = aValue as any;
      const bVal = bValue as any;
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [students, searchTerm, filterCarrera, filterEstado, sortField, sortDirection]);

  const handleSort = (field: keyof UIStudent) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleVerDetalles = (studentId: string | number) => {
    navigate(`/estudiante/${studentId}`);
  };

  const handleDeleteStudent = async (studentId: string | number) => {
    showConfirm({
      title: 'Eliminar estudiante',
      message: '¿Seguro que deseas eliminar este estudiante? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      confirmColor: 'error',
      onConfirm: async () => {
        await estudianteService.delete(String(studentId));
        setStudents((prev) => prev.filter((student) => {
          const id = String((student as any).id_estudiante || student.id);
          return id !== String(studentId);
        }));
        logger.log('🗑️ Estudiante eliminado:', studentId);
      }
    });
  };

  const loadStudents = useCallback(async () => {
    logger.log('🔍 Cargando estudiantes de generación:', id);
    try {
      const dataStudents = await estudianteService.getByGeneracion(id || '');
      const studentsWithStats = await enrichStudentsWithStats(dataStudents);
      setStudents(studentsWithStats);
      logger.log('✅ Estudiantes cargados:', dataStudents.length);
      
      if (dataStudents.length === 0) {
        logger.log('📂 Generación nueva detectada, abriendo formulario...');
        setTimeout(() => {
          setOpenCreateEstudiante(true);
        }, 500);
      }
    } catch (error) {
      logger.error('❌ Error al cargar estudiantes de generación:', error);
      setStudents([]);
    }
  }, [enrichStudentsWithStats, generationId, id]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleAddStudent = () => {
    setOpenCreateEstudiante(true);
  };

  const handleEstudianteCreated = async () => {
    console.log('🔄 Recargando estudiantes de generación', id, 'después de crear nuevo estudiante...');
    try {
      await loadStudents();
    } catch (error) {
      logger.error('❌ Error al recargar estudiantes:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: '#FFFBF0' }}>
      {/* Marcos de fondo */}
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

      {/* Partículas */}
      <DashboardParticles />

      {/* Navbar estilo Dashboard */}
      <DashboardNavbar usuario={usuario} onLogout={handleLogout} />

      {/* Contenido Principal */}
      <div className="relative z-10 flex-1 max-w-7xl mx-auto px-6 lg:px-8 py-8 w-full">
        <GenerationHeader
          generationYear={generationId}
          totalStudents={filteredAndSortedStudents.length}
          onBack={() => navigate('/dashboard')}
          onAddStudent={handleAddStudent}
        />

        <StudentFilterPanel
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCarrera={filterCarrera}
          onCarreraChange={setFilterCarrera}
          selectedEstado={filterEstado}
          onEstadoChange={setFilterEstado}
          carreras={carreras}
          estados={estados}
        />

        <StudentsTable
          students={filteredAndSortedStudents}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onViewDetails={handleVerDetalles}
          onDelete={handleDeleteStudent}
        />
      </div>

      {/* Modal para crear estudiante */}
      <CreateEstudianteModal
        open={openCreateEstudiante}
        onClose={() => setOpenCreateEstudiante(false)}
        onSuccess={handleEstudianteCreated}
        generacion={generationId}
      />
      <ConfirmDialog/>
    </div>
  );
};
