import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  estudianteService,
  entrevistaService,
} from '../../services';
import { logger } from '../../config';
import { GenerationHeader, StudentFilterPanel, StudentsTable } from '../../components/features/generacion-view';
import { CreateEstudianteModal } from '../../components/features/estudiantes';
import { ExcelImportModal } from '../../components/features/estudiantes/ExcelImportModal';
import { Spinner, ErrorMessage, useConfirmDialog } from '../../components/ui';
import { daysSince } from '../../utils/dateHelpers';
import type { Estudiante } from '../../types';

export type UIStudent = Estudiante & {
  ultimaEntrevista?: string;
  totalEntrevistasAno?: number;
  diasSinEntrevista?: number;
  tienePendienteNotas?: boolean;
  promedio?: number;
};

export default function GeneracionViewSimple() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // El param :id ahora es el ID real de la generación (no el año)
  const generacionId = parseInt(id || '0', 10);

  const [año, setAño] = useState<number>(0);
  const [generacionLoading, setGeneracionLoading] = useState(true);
  const [generacionError, setGeneracionError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCarrera, setFilterCarrera] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [sortField, setSortField] = useState<keyof UIStudent>('apellido');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [students, setStudents] = useState<UIStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [openCreateEstudiante, setOpenCreateEstudiante] = useState(false);
  const [openExcelImport, setOpenExcelImport] = useState(false);
  const { showConfirm, ConfirmDialog } = useConfirmDialog();

  // 1. Cargar el año desde el id para mostrarlo en el header
  useEffect(() => {
    if (!generacionId) return;
    setGeneracionLoading(true);
    setGeneracionError(null);
    estudianteService.getGeneracionById(generacionId)
      .then((gen) => setAño(gen.año))
      .catch(() => setGeneracionError(`No se encontró la generación (id ${generacionId}).`))
      .finally(() => setGeneracionLoading(false));
  }, [generacionId]);

  const normalizeNumber = (value?: number | string | null) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
    const cleaned = String(value).replace(',', '.').trim();
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : undefined;
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
          logger.warn('⚠️ No se pudieron cargar entrevistas', { studentId, error });
          return [];
        });

        const entrevistasList = Array.isArray(entrevistas) ? entrevistas : [];

        const ultimaEntrevistaDate = entrevistasList
          .map((e) => (e?.fecha ? new Date(e.fecha) : undefined))
          .filter((d): d is Date => Boolean(d))
          .sort((a, b) => b.getTime() - a.getTime())[0];

        const ultimaEntrevista = ultimaEntrevistaDate?.toISOString();
        const totalEntrevistasAno = entrevistasList.filter((e) => {
          const f = e?.fecha ? new Date(e.fecha) : undefined;
          return f?.getFullYear() === currentYear;
        }).length;
        const diasSinEntrevista = ultimaEntrevista ? daysSince(ultimaEntrevista) : undefined;

        const tienePendienteNotas = student.ramos
          ? student.ramos.some((r) => r.estado === 'CURSANDO')
          : false;

        return {
          ...student,
          promedio: normalizeNumber(student.promedios_media),
          ultimaEntrevista,
          totalEntrevistasAno,
          diasSinEntrevista,
          tienePendienteNotas,
        };
      })
    );
  }, []);

  const loadStudents = useCallback(async () => {
    if (generacionId === null) return;
    logger.log('🔍 Cargando estudiantes de generación id:', generacionId);
    setStudentsLoading(true);
    try {
      const dataStudents = await estudianteService.getByGeneracion(generacionId);
      const studentsWithStats = await enrichStudentsWithStats(dataStudents);
      setStudents(studentsWithStats);
      logger.log('✅ Estudiantes cargados:', dataStudents.length);

      if (dataStudents.length === 0) {
        logger.log('📂 Generación vacía, abriendo formulario...');
        setTimeout(() => setOpenCreateEstudiante(true), 500);
      }
    } catch (error) {
      logger.error('❌ Error al cargar estudiantes:', error);
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  }, [generacionId, enrichStudentsWithStats]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const carreras = [...new Set(students.map((s) =>
    (s.carreras && s.carreras.length > 0 ? s.carreras[0].nombre_carrera : null) || 'Sin carrera'
  ).filter(Boolean))];

  const estados = [...new Set(students.map((s) => s.estado || 'ACTIVO'))];

  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter((student) => {
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

    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
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
        setStudents((prev) => prev.filter((s) => s.rut_estudiante !== String(studentId)));
        logger.log('🗑️ Estudiante eliminado:', studentId);
      },
    });
  };

  if (generacionLoading) return <Spinner fullScreen message="Cargando generación..." />;
  if (generacionError) return <ErrorMessage fullScreen message={generacionError} onRetry={() => window.location.reload()} />;

  return (
    <>
      <GenerationHeader
        generationYear={año}
        totalStudents={filteredAndSortedStudents.length}
        onBack={() => navigate(-1)}
        onAddStudent={() => setOpenCreateEstudiante(true)}
        onUploadExcel={() => setOpenExcelImport(true)}
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

      {studentsLoading ? (
        <Spinner message="Cargando estudiantes..." />
      ) : (
        <StudentsTable
          students={filteredAndSortedStudents}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onViewDetails={handleVerDetalles}
          onDelete={handleDeleteStudent}
        />
      )}

      {/* Modal: crear estudiante individual */}
      {generacionId !== null && (
        <>
          <CreateEstudianteModal
            open={openCreateEstudiante}
            onClose={() => setOpenCreateEstudiante(false)}
            onSuccess={loadStudents}
            generacionId={generacionId}
          />

          <ExcelImportModal
            open={openExcelImport}
            onClose={() => setOpenExcelImport(false)}
            onSuccess={loadStudents}
            generacionId={generacionId}
            generacionAño={año}
          />
        </>
      )}

      <ConfirmDialog />
    </>
  );
}
