import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  estudianteService,
  entrevistaService,
  alertasService,
  liceoService,
} from '../../services';
import { logger } from '../../config';
import { GenerationHeader, StudentsTable } from '../../components/features/generacion-view';
import { CreateEstudianteModal } from '../../components/features/estudiantes';
import { ExcelImportModal } from '../../components/features/estudiantes/ExcelImportModal';
import { Spinner, ErrorMessage, useConfirmDialog } from '../../components/ui';
import { useAuthContext } from '../../context/AuthContext';
import PermissionService from '../../services/permissionService';
import type { Estudiante } from '../../types';

const SELECT_CLASS =
  'text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#65B39B] focus:ring-1 focus:ring-[#65B39B] transition-colors flex-1 min-w-[140px]';

export type UIStudent = Estudiante & {
  ultimaEntrevista?: string;
  totalEntrevistasAno?: number;
  promedio?: number;
};

export default function GeneracionViewSimple() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const generacionId = parseInt(id || '0', 10);

  const [año, setAño] = useState<number>(0);
  const [generacionLoading, setGeneracionLoading] = useState(true);
  const [generacionError, setGeneracionError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterAlertas, setFilterAlertas] = useState<'todas' | 'con' | 'sin'>('todas');
  const [sortField, setSortField] = useState<keyof UIStudent>('apellido');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [students, setStudents] = useState<UIStudent[]>([]);
  const [alertasRuts, setAlertasRuts] = useState<string[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [openCreateEstudiante, setOpenCreateEstudiante] = useState(false);
  const [openExcelImport, setOpenExcelImport] = useState(false);
  const { showConfirm, ConfirmDialog } = useConfirmDialog();
  const { usuario } = useAuthContext();
  const canEdit   = PermissionService.canEditStudent(usuario);   // Admin + Tutor
  const canDelete = PermissionService.canDeleteStudent(usuario); // Admin only

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

  // 2. Cargar alertas cuando el año esté disponible
  useEffect(() => {
    if (!año) return;
    alertasService.getAlertasByGeneracion(String(año))
      .then((data) =>
        setAlertasRuts(data.map((a) => a.rut_estudiante).filter((r): r is string => Boolean(r)))
      )
      .catch(() => setAlertasRuts([]));
  }, [año]);

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
          .map((e) => (e?.fecha_hora ? new Date(e.fecha_hora) : undefined))
          .filter((d): d is Date => Boolean(d))
          .sort((a, b) => b.getTime() - a.getTime())[0];

        const ultimaEntrevista = ultimaEntrevistaDate?.toISOString();
        const totalEntrevistasAno = entrevistasList.filter((e) => {
          const f = e?.fecha_hora ? new Date(e.fecha_hora) : undefined;
          return f?.getFullYear() === currentYear;
        }).length;

        return {
          ...student,
          promedio: normalizeNumber(student.promedios_media),
          ultimaEntrevista,
          totalEntrevistasAno,
        };
      })
    );
  }, []);

  const loadStudents = useCallback(async () => {
    if (generacionId === null) return;
    logger.log('🔍 Cargando estudiantes de generación id:', generacionId);
    setStudentsLoading(true);
    try {
      const [dataStudents, liceos] = await Promise.all([
        estudianteService.getByGeneracion(generacionId),
        liceoService.getAll().catch(() => []),
      ]);
      const liceoMap = new Map(liceos.map(l => [l.rbd, l]));
      const dataConLiceo = dataStudents.map(s => ({
        ...s,
        liceo: liceoMap.get(s.rbd_liceo) ?? s.liceo,
      }));
      const studentsWithStats = await enrichStudentsWithStats(dataConLiceo);
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

  const estados = [...new Set(students.map((s) => s.estado))];

  const filteredAndSortedStudents = useMemo(() => {
    const alertasSet = new Set(alertasRuts);

    let filtered = students.filter((student) => {
      const nombre = student.nombre || '';
      const apellido = student.apellido || '';
      const rut = student.rut_estudiante || '';
      const estado = student.estado;

      const matchesSearch =
        nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rut.includes(searchTerm);

      const matchesEstado = !filterEstado || estado === filterEstado;

      return matchesSearch && matchesEstado;
    });

    if (filterAlertas !== 'todas') {
      filtered = filtered.filter((s) => {
        const tieneAlerta = alertasSet.has(s.rut_estudiante || '');
        return filterAlertas === 'con' ? tieneAlerta : !tieneAlerta;
      });
    }

    filtered.sort((a, b) => {
      let aVal: string | number | null | undefined = a[sortField] as string | number | null | undefined;
      let bVal: string | number | null | undefined = b[sortField] as string | number | null | undefined;

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
  }, [students, alertasRuts, searchTerm, filterEstado, filterAlertas, sortField, sortDirection]);

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
        onAddStudent={canEdit ? () => setOpenCreateEstudiante(true) : undefined}
        onUploadExcel={canEdit ? () => setOpenExcelImport(true) : undefined}
      />

      <div
        className="bg-white rounded-xl px-5 py-4 space-y-3"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
      >
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Búsqueda y filtros</p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nombre, apellido o RUT..."
            className="w-56 text-sm border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#65B39B] focus:ring-1 focus:ring-[#65B39B] transition-colors bg-gray-50 focus:bg-white"
          />
          <select
            value={filterAlertas}
            onChange={(e) => setFilterAlertas(e.target.value as 'todas' | 'con' | 'sin')}
            className={SELECT_CLASS}
          >
            <option value="todas">Alertas: Todas</option>
            <option value="con">Con alerta</option>
            <option value="sin">Sin alerta</option>
          </select>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">Todos los estados</option>
            {estados.map((estado) => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-6">
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
            canDelete={canDelete}
            alertasRuts={alertasRuts}
          />
        )}
      </div>


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
