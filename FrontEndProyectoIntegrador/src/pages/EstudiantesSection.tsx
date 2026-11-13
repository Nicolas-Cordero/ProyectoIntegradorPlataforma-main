import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { estudianteService, entrevistaService, alertasService } from '../services';
import { logger } from '../config';
import { Spinner, ErrorMessage, useConfirmDialog } from '../components/ui';
import { StudentsTable } from '../components/features/generacion-view';
import { CreateEstudianteModal, StudentFilters, useStudentFilters, conResumenEntrevistas } from '../components/features/estudiantes';
import { useAuthContext } from '../context/AuthContext';
import PermissionService from '../services/permissionService';
import type { UIStudent } from './GeneracionSection/GeneracionView';

type StudentWithStats = UIStudent;

export const EstudiantesSection: React.FC = () => {
  const navigate = useNavigate();
  const { showConfirm, ConfirmDialog } = useConfirmDialog();
  const { usuario } = useAuthContext();
  const canEdit = PermissionService.canEditStudent(usuario);
  const canDelete = PermissionService.canDeleteStudent(usuario);

  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [alertasRuts, setAlertasRuts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCrear, setOpenCrear] = useState(false);

  const [sortField, setSortField] = useState<keyof UIStudent>('apellido');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [raw, alertasData, resumen] = await Promise.all([
        estudianteService.getAll(),
        alertasService.getAlertas().catch(() => []),
        entrevistaService.getResumen().catch((err) => {
          logger.warn('No se pudo cargar el resumen de entrevistas', err);
          return [];
        }),
      ]);
      setAlertasRuts(
        alertasData.map((a) => a.rut_estudiante).filter((r): r is string => Boolean(r))
      );
      setStudents(conResumenEntrevistas(raw, resumen));
    } catch (err) {
      logger.error('Error al cargar estudiantes:', err);
      setError('No se pudo cargar la lista de estudiantes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const studentFilters = useStudentFilters(students, alertasRuts);
  const { filtrados } = studentFilters;

  const limpiarFiltros = () => {
    studentFilters.limpiar();
    setSortField('apellido');
    setSortDirection('asc');
  };

  const filteredStudents = useMemo(() => {
    return [...filtrados].sort((a, b) => {
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
  }, [filtrados, sortField, sortDirection]);

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

          <StudentFilters {...studentFilters} onLimpiar={limpiarFiltros} />

          {/* Contador */}
          <p className="text-right text-sm text-gray-600">
            Mostrando{' '}
            <strong className="text-gray-800">{filteredStudents.length}</strong> de{' '}
            <strong className="text-gray-800">{students.length}</strong> estudiantes
          </p>

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
