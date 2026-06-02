import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  estudianteService,
  entrevistaService,
} from '../services';
import { logger } from '../config';
import { GenerationHeader, StudentFilterPanel, StudentsTable } from '../components/features/generacion-view';
import { CreateEstudianteModal } from '../components/features/estudiantes';
import { daysSince } from '../utils/dateHelpers';
import type { Estudiante } from '../types';
import { useConfirmDialog } from '../components/ui';

export type UIStudent = Estudiante & {
  ultimaEntrevista?: string;
  totalEntrevistasAno?: number;
  diasSinEntrevista?: number;
  tienePendienteNotas?: boolean;
  promedio?: number;
};

export default function GeneracionViewSimple(){
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const generationId = parseInt(id || '2024', 10);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCarrera, setFilterCarrera] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [sortField, setSortField] = useState<keyof UIStudent>('apellido');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [students, setStudents] = useState<UIStudent[]>([]);
  const [openCreateEstudiante, setOpenCreateEstudiante] = useState(false);
  const { showConfirm, ConfirmDialog } = useConfirmDialog();

  const normalizeNumber = (value?: number | string | null) => {
    if (value === null || value === undefined) return undefined;

    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;

    const cleaned = String(value).replace(',', '.').trim();
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : undefined;
  };

  const calculatePromedio = (
    student: Estudiante,
    _historiales: any[],
    _ramos: any[]
  ): number | undefined => {
    return normalizeNumber(student.promedios_media);
  };

  const enrichStudentsWithStats = useCallback(async (rawStudents: Estudiante[]): Promise<UIStudent[]> => {
    const currentYear = new Date().getFullYear();

    return Promise.all(
      rawStudents.map(async (student) => {
        const studentId = student.rut_estudiante;

        if (!studentId) {
          return {
            ...student,
            promedio: normalizeNumber(student.promedios_media),
            totalEntrevistasAno: 0,
          };
        }

        const entrevistas = await entrevistaService.getByEstudiante(studentId).catch((error) => {
          logger.warn('⚠️ No se pudieron cargar entrevistas del estudiante', { studentId, error });
          return [];
        });

        const entrevistasList = Array.isArray(entrevistas) ? entrevistas : [];

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

        const promedioCalculado = calculatePromedio(student, [], []);
        const tienePendienteNotas = student.ramos ? student.ramos.some(
          (ramo) => ramo.estado === 'CURSANDO'
        ) : false;

        return {
          ...student,
          promedio: promedioCalculado,
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
    (student.carreras && student.carreras.length > 0 ? student.carreras[0].nombre_carrera : null) || 'Sin carrera'
  ).filter(Boolean))];
  const estados = [...new Set(students.map(student =>
    student.estado || 'ACTIVO'
  ))];

  // Filtrar y ordenar estudiantes
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter(student => {
      const nombre = student.nombre || '';
      const apellido = student.apellido || '';
      const rut = student.rut_estudiante || '';
      const carrera = (student.carreras && student.carreras.length > 0 ? student.carreras[0].nombre_carrera : '') || '';
      const estado = student.estado || 'ACTIVO';

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
          return student.rut_estudiante !== String(studentId);
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
    logger.log('Recargando estudiantes de generación', id, 'después de crear nuevo estudiante...');
    try {
      await loadStudents();
    } catch (error) {
      logger.error('❌ Error al recargar estudiantes:', error);
    }
  };

  return (
    <>
      <GenerationHeader
        generationYear={generationId}
        totalStudents={filteredAndSortedStudents.length}
        onBack={() => navigate(-1)}
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

      {/* Modal para crear estudiante */}
      <CreateEstudianteModal
        open={openCreateEstudiante}
        onClose={() => setOpenCreateEstudiante(false)}
        onSuccess={handleEstudianteCreated}
        generacion={generationId}
      />
      <ConfirmDialog/>
    </>
  );
};
