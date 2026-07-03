import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { estudianteService, entrevistaService, alertasService, liceoService } from '../services';
import { logger } from '../config';
import { Spinner, ErrorMessage, useConfirmDialog } from '../components/ui';
import { StudentsTable } from '../components/features/generacion-view';
import { CreateEstudianteModal } from '../components/features/estudiantes';
import { useAuthContext } from '../context/AuthContext';
import PermissionService from '../services/permissionService';
import type { Estudiante } from '../types';
import type { UIStudent } from './GeneracionSection/GeneracionView';

const SORT_OPTIONS: { label: string; field: keyof UIStudent; dir: 'asc' | 'desc' }[] = [
  { label: 'Nombre A→Z', field: 'apellido', dir: 'asc' },
  { label: 'Nombre Z→A', field: 'apellido', dir: 'desc' },
  { label: 'Entrevista más reciente', field: 'ultimaEntrevista', dir: 'desc' },
  { label: 'Entrevista más antigua', field: 'ultimaEntrevista', dir: 'asc' },
];

type StudentWithStats = UIStudent;

const SELECT_CLASS =
  'text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#65B39B] focus:ring-1 focus:ring-[#65B39B] transition-colors flex-1 min-w-[140px]';

export const EstudiantesSection: React.FC = () => {
  const navigate = useNavigate();
  const { showConfirm, ConfirmDialog } = useConfirmDialog();
  const { usuario } = useAuthContext();
  const canEdit = PermissionService.canEditStudent(usuario);
  const canDelete = PermissionService.canDeleteStudent(usuario);

  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [alertasRuts, setAlertasRuts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openCrear, setOpenCrear] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [filterLiceo, setFilterLiceo] = useState('');
  const [filterAlertas, setFilterAlertas] = useState<'todas' | 'con' | 'sin'>('todas');

  const [sortField, setSortField] = useState<keyof UIStudent>('apellido');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchTerm(value), 200);
  };

  const enrichStudents = useCallback(async (raw: Estudiante[]): Promise<StudentWithStats[]> => {
    const currentYear = new Date().getFullYear();

    return Promise.all(
      raw.map(async (student) => {
        const studentId = student.rut_estudiante;

        if (!studentId) {
          return {
            ...student,
            totalEntrevistasAno: 0,
          };
        }

        const entrevistas = await entrevistaService.getByEstudiante(studentId).catch((err) => {
          logger.warn('No se pudieron cargar entrevistas', { studentId, err });
          return [];
        });

        const lista = Array.isArray(entrevistas) ? entrevistas : [];

        const ultimaDate = lista
          .map((e) => (e?.fecha_hora ? new Date(e.fecha_hora) : undefined))
          .filter((d): d is Date => Boolean(d))
          .sort((a, b) => b.getTime() - a.getTime())[0];

        const ultimaEntrevista = ultimaDate?.toISOString();
        const totalEntrevistasAno = lista.filter((e) => {
          const f = e?.fecha_hora ? new Date(e.fecha_hora) : undefined;
          return f?.getFullYear() === currentYear;
        }).length;

        return {
          ...student,
          ultimaEntrevista,
          totalEntrevistasAno,
        };
      })
    );
  }, []);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [raw, alertasData, liceos] = await Promise.all([
        estudianteService.getAll(),
        alertasService.getAlertas().catch(() => []),
        liceoService.getAll().catch(() => []),
      ]);
      const liceoMap = new Map(liceos.map(l => [l.rbd, l]));
      const rawConLiceo = raw.map(s => ({
        ...s,
        liceo: liceoMap.get(s.rbd_liceo) ?? s.liceo,
      }));
      setAlertasRuts(
        alertasData.map((a) => a.rut_estudiante).filter((r): r is string => Boolean(r))
      );
      setLoading(false);
      setEnriching(true);
      const enriched = await enrichStudents(rawConLiceo);
      setStudents(enriched);
    } catch (err) {
      logger.error('Error al cargar estudiantes:', err);
      setError('No se pudo cargar la lista de estudiantes.');
      setLoading(false);
    } finally {
      setEnriching(false);
    }
  }, [enrichStudents]);

  useEffect(() => {
    loadStudents();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [loadStudents]);

  const liceoOptions = useMemo(
    () => [...new Set(students.map((s) => s.liceo?.nombre || s.rbd_liceo || '').filter(Boolean))].sort(),
    [students]
  );

  const limpiarFiltros = () => {
    setSearchInput('');
    setSearchTerm('');
    setFilterLiceo('');
    setFilterAlertas('todas');
    setSortField('apellido');
    setSortDirection('asc');
  };

  const hayFiltrosActivos =
    !!searchTerm ||
    !!filterLiceo ||
    filterAlertas !== 'todas';

  const filteredStudents = useMemo(() => {
    const alertasSet = new Set(alertasRuts);
    let result: StudentWithStats[] = students;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((s) => {
        const nombre = `${s.nombre || ''} ${s.apellido || ''}`.toLowerCase();
        const liceo = (s.liceo?.nombre || s.rbd_liceo || '').toLowerCase();
        return nombre.includes(lower) || liceo.includes(lower);
      });
    }

    if (filterLiceo) {
      result = result.filter((s) => (s.liceo?.nombre || s.rbd_liceo || '') === filterLiceo);
    }

    if (filterAlertas !== 'todas') {
      result = result.filter((s) => {
        const tieneAlerta = alertasSet.has(s.rut_estudiante);
        return filterAlertas === 'con' ? tieneAlerta : !tieneAlerta;
      });
    }

    return [...result].sort((a, b) => {
      let aVal: string | number | null | undefined = a[sortField] as string | number | null | undefined;
      let bVal: string | number | null | undefined = b[sortField] as string | number | null | undefined;
      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [
    students,
    alertasRuts,
    searchTerm,
    filterLiceo,
    filterAlertas,
    sortField,
    sortDirection,
  ]);

  const handleSort = (field: keyof UIStudent) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleVerDetalles = (studentId: string | number) => {
    navigate(`/estudiante/${studentId}`);
  };

  const handleDeleteStudent = (studentId: string | number) => {
    showConfirm({
      title: 'Eliminar estudiante',
      message: '¿Seguro que deseas eliminar este estudiante? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      confirmColor: 'error',
      onConfirm: async () => {
        await estudianteService.delete(String(studentId));
        setStudents((prev) =>
          prev.filter((s) => s.rut_estudiante !== String(studentId))
        );
      },
    });
  };

  if (loading) return <Spinner fullScreen message="Cargando estudiantes..." />;
  if (error) return <ErrorMessage fullScreen message={error} onRetry={loadStudents} />;

  return (
    <>
      <div className="min-h-screen bg-[#FFFBF0]/90 py-8 rounded-2xl">
        <div className="max-w-7xl mx-auto px-4 space-y-5">

          {/* Header */}
          <div
            className="rounded-2xl p-6 md:p-10 text-white relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #65B39B 0%, #4a9e87 40%, #C7654F 100%)',
              boxShadow: '0 8px 32px rgba(101, 179, 155, 0.35)',
            }}
          >
            <div className="absolute -top-10 -right-10 w-[180px] h-[180px] rounded-full bg-white/[0.08] pointer-events-none" />
            <div className="absolute -bottom-[50px] right-20 w-[130px] h-[130px] rounded-full bg-white/[0.06] pointer-events-none" />
            <div className="flex items-center justify-between relative w-full">
              <div className="flex items-center gap-5">
                <div className="bg-white/20 rounded-xl p-4 flex items-center justify-center backdrop-blur-sm text-4xl leading-none">
                  🎓
                </div>
                <div>
                  <h1 className="text-[2rem] font-bold leading-tight">Estudiantes</h1>
                  <p className="text-base opacity-85 mt-1">
                    {students.length} estudiante{students.length !== 1 ? 's' : ''} en el sistema
                    {enriching && (
                      <span className="ml-2 text-sm opacity-70 italic">
                        · cargando entrevistas...
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {canEdit && (
                <button
                  onClick={() => setOpenCrear(true)}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 border border-white/30 hover:border-white/50 whitespace-nowrap"
                >
                  + Nuevo estudiante
                </button>
              )}
            </div>
          </div>

          {/* Filtros + Buscador unificados */}
          <div
            className="bg-white rounded-xl px-5 py-4 space-y-3"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Búsqueda y filtros</p>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar por nombre o liceo..."
                className="w-56 text-sm border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#65B39B] focus:ring-1 focus:ring-[#65B39B] transition-colors bg-gray-50 focus:bg-white"
              />
              <select
                value={filterLiceo}
                onChange={(e) => setFilterLiceo(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="">Todos los liceos</option>
                {liceoOptions.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>

              <select
                value={filterAlertas}
                onChange={(e) => setFilterAlertas(e.target.value as 'todas' | 'con' | 'sin')}
                className={SELECT_CLASS}
              >
                <option value="todas">Alertas: Todas</option>
                <option value="con">Con alertas</option>
                <option value="sin">Sin alertas</option>
              </select>

            </div>
          </div>

          {/* Barra de ordenamiento + contador */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Ordenar por:</span>
              <select
                value={`${String(sortField)}:${sortDirection}`}
                onChange={(e) => {
                  const [field, dir] = e.target.value.split(':');
                  setSortField(field as keyof UIStudent);
                  setSortDirection(dir as 'asc' | 'desc');
                }}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#65B39B] focus:ring-1 focus:ring-[#65B39B] transition-colors"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={`${String(opt.field)}:${opt.dir}`} value={`${String(opt.field)}:${opt.dir}`}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Mostrando{' '}
                <strong className="text-gray-800">{filteredStudents.length}</strong> de{' '}
                <strong className="text-gray-800">{students.length}</strong> estudiantes
              </span>
              {hayFiltrosActivos && (
                <button
                  onClick={limpiarFiltros}
                  className="text-sm text-[#C7654F] hover:text-[#a04a38] font-semibold underline transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Contenido principal */}
          {students.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                No hay estudiantes registrados
              </h3>
              <p className="text-gray-500">Aún no se han agregado estudiantes al sistema.</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Sin resultados</h3>
              <p className="text-gray-500 mb-5">
                Ningún estudiante coincide con los filtros aplicados.
              </p>
              <button
                onClick={limpiarFiltros}
                className="text-sm text-[#65B39B] hover:text-[#4a9e87] font-semibold underline transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <StudentsTable
              students={filteredStudents}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onViewDetails={handleVerDetalles}
              onDelete={handleDeleteStudent}
              alertasRuts={alertasRuts}
              canDelete={canDelete}
            />
          )}

        </div>
      </div>
      <ConfirmDialog />

      <CreateEstudianteModal
        open={openCrear}
        onClose={() => setOpenCrear(false)}
        onSuccess={loadStudents}
      />
    </>
  );
};
