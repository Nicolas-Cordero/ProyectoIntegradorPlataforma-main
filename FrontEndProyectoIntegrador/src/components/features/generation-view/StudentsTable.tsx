import React from 'react';
import { formatDateChilean } from '../../../utils/dateHelpers';
import type { Estudiante } from '../../../types';

type UIStudent = Estudiante & {
  ultimaEntrevista?: string;
  totalEntrevistasAno?: number;
  diasSinEntrevista?: number;
  tienePendienteNotas?: boolean;
};

interface StudentsTableProps {
  students: UIStudent[];
  sortField: keyof UIStudent;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof UIStudent) => void;
  onViewDetails: (studentId: string | number) => void;
  onDelete: (studentId: string | number) => void;
}

/**
 * Table component for displaying students
 * Includes sorting, status badges, and action buttons
 */
export const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  sortField,
  sortDirection,
  onSort,
  onViewDetails,
  onDelete,
}) => {
  // Umbrales de alerta por días sin entrevista
  const WARNING_DAYS = 30;
  const ALERT_DAYS = 60;

  const getSortIcon = (field: keyof UIStudent) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getPromedioInfo = (promedio: UIStudent['promedio']) => {
    const rawValue = typeof promedio === 'number'
      ? promedio
      : promedio !== undefined && promedio !== null
        ? Number(promedio)
        : undefined;

    const value = Number.isFinite(rawValue) ? rawValue as number : undefined;

    if (value === undefined) {
      return { value: undefined, colorClass: 'text-[var(--color-coral-dark)]' };
    }

    if (value >= 6.0) return { value, colorClass: 'text-[var(--color-turquoise)]' };
    if (value >= 5.5) return { value, colorClass: 'text-[var(--color-orange)]' };
    return { value, colorClass: 'text-[var(--color-coral-dark)]' };
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th 
              onClick={() => onSort('apellidos')}
              className="py-4 px-3 text-left font-bold cursor-pointer border-b-2 border-gray-300 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Nombre {getSortIcon('apellidos')}
            </th>
            <th 
              onClick={() => onSort('carrera')}
              className="py-4 px-3 text-left font-bold cursor-pointer border-b-2 border-gray-300 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Carrera {getSortIcon('carrera')}
            </th>
            <th 
              onClick={() => onSort('estado')}
              className="py-4 px-3 text-center font-bold cursor-pointer border-b-2 border-gray-300 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Estado {getSortIcon('estado')}
            </th>
            <th 
              onClick={() => onSort('promedio')}
              className="py-4 px-3 text-center font-bold cursor-pointer border-b-2 border-gray-300 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Promedio {getSortIcon('promedio')}
            </th>
            <th className="py-4 px-3 text-center font-bold border-b-2 border-gray-300 text-gray-700 min-w-[120px]">
              Última Entrevista
            </th>
            <th className="py-4 px-3 text-center font-bold border-b-2 border-gray-300 text-gray-700">
              Entrevistas (Año)
            </th>
            <th className="py-4 px-3 text-center font-bold border-b-2 border-gray-300 text-gray-700">
              Alertas
            </th>
            <th className="py-4 px-3 text-center font-bold border-b-2 border-gray-300 text-gray-700">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => {
            const { value: promedioValor, colorClass: promedioColor } = getPromedioInfo(student.promedio);

            return (
              <tr 
                key={(student as any).id_estudiante || student.id || index}
                className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-[var(--color-turquoise)]/10 transition-colors`}
              >
                <td className="py-3 px-3 border-b border-gray-300">
                  <div className="font-bold text-gray-800">
                    { (student as any).nombre || `${student.nombres || ''} ${student.apellidos || ''}` }
                  </div>
                  <div className="text-xs text-gray-500">
                    {student.rut}
                  </div>
                </td>
                <td className="py-3 px-3 border-b border-gray-300 text-gray-600">
                  {student.carrera || student.institucion?.carrera_especialidad || 'N/A'}
                  <div className="text-xs text-gray-400">
                    {student.universidad || student.institucion?.nombre || ''}
                  </div>
                </td>
                <td className="py-3 px-3 border-b border-gray-300 text-center">
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${(() => {
                      const estado = (student.estado || 'activo').toLowerCase();
                      if (estado === 'activo') return 'bg-green-100 text-green-800 border-green-300';
                      if (estado === 'inactivo') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
                      if (estado === 'egresado') return 'bg-blue-100 text-blue-800 border-blue-300';
                      if (estado === 'retirado') return 'bg-red-100 text-red-800 border-red-300';
                      return 'bg-gray-100 text-gray-800 border-gray-300';
                    })()}`}
                  >
                    {student.estado || 'Activo'}
                  </span>
                </td>
                <td className={`py-3 px-3 border-b border-gray-300 text-center font-bold ${promedioColor}`}>
                  {promedioValor !== undefined ? promedioValor.toFixed(1) : 'N/A'}
                </td>
                <td className="py-3 px-3 border-b border-gray-300 text-center text-sm">
                  {formatDateChilean(student.ultimaEntrevista)}
                </td>
                <td className="py-3 px-3 border-b border-gray-300 text-center font-bold">
                  {student.totalEntrevistasAno || 0}
                </td>
                <td className="py-3 px-3 border-b border-gray-300 text-center">
                  <div className="flex gap-1 justify-center flex-wrap">
                    {student.diasSinEntrevista !== undefined && (
                      <span
                        className={`px-2.5 py-1 rounded text-sm font-bold border ${
                          student.diasSinEntrevista >= ALERT_DAYS
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : student.diasSinEntrevista >= WARNING_DAYS
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                              : 'bg-green-100 text-green-800 border-green-300'
                        }`}
                        title={`${student.diasSinEntrevista} días sin entrevista`}
                      >
                        ⏰ {student.diasSinEntrevista}d
                      </span>
                    )}
                    {student.tienePendienteNotas && (
                      <span 
                        className="px-1.5 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-300"
                        title="Pendiente de notas"
                      >
                        📝
                      </span>
                    )}
                    {student.diasSinEntrevista === undefined && !student.tienePendienteNotas ? (
                      <span className="text-gray-400 text-sm">—</span>
                    ) : null}
                  </div>
                </td>
                <td className="py-3 px-3 border-b border-gray-300 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onViewDetails((student as any).id_estudiante || student.id)}
                        className="px-3 py-1.5 bg-[var(--color-turquoise)] text-white rounded hover:bg-[var(--color-turquoise-light)] transition-colors text-xs font-bold"
                      >
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => onDelete((student as any).id_estudiante || student.id)}
                        className="px-3 py-1.5 bg-[var(--color-coral-dark)] text-white rounded hover:bg-red-500 transition-colors text-xs font-bold"
                      >
                        Eliminar
                      </button>
                    </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {students.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="text-7xl mb-4">📂</div>
          <h3 className="text-gray-700 mb-2 text-2xl font-bold">
            Esta generación aún no tiene estudiantes
          </h3>
          <p className="text-gray-500 text-lg">
            Haz clic en "Agregar Estudiante" para comenzar a agregar estudiantes a esta generación
          </p>
        </div>
      )}
    </div>
  );
};
