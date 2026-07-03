import React from 'react';
import { Button, DateLabel } from '../../../components/ui';
import type { Estudiante } from '../../../types';

type UIStudent = Estudiante & {
  ultimaEntrevista?: string;
  totalEntrevistasAno?: number;
};

interface StudentsTableProps {
  students: UIStudent[];
  sortField: keyof UIStudent;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof UIStudent) => void;
  onViewDetails: (studentId: string | number) => void;
  onDelete: (studentId: string | number) => void;
  canDelete?: boolean;
  canAdd?: boolean;
  alertasRuts?: string[];
}

export const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  sortField,
  sortDirection,
  onSort,
  onViewDetails,
  onDelete,
  canDelete = false,
  alertasRuts = [],
}) => {
  const alertasSet = new Set(alertasRuts);

  const getSortIcon = (field: keyof UIStudent) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th
              onClick={() => onSort('apellido')}
              className="py-4 px-3 text-left font-bold cursor-pointer border-b-2 border-gray-300 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Nombre {getSortIcon('apellido')}
            </th>
            <th
              onClick={() => onSort('rbd_liceo')}
              className="py-4 px-3 text-left font-bold cursor-pointer border-b-2 border-gray-300 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Liceo {getSortIcon('rbd_liceo')}
            </th>
            <th
              onClick={() => onSort('estado')}
              className="py-4 px-3 text-center font-bold cursor-pointer border-b-2 border-gray-300 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Estado {getSortIcon('estado')}
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
            const tieneAlerta = alertasSet.has(student.rut_estudiante);

            return (
              <tr
                key={student.rut_estudiante || index}
                className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-[var(--color-turquoise)]/10 transition-colors`}
              >
                <td className="py-3 px-3 border-b border-gray-300">
                  <div className="font-bold text-gray-800">
                    {`${student.nombre || ''} ${student.apellido || ''}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {student.rut_estudiante}
                  </div>
                </td>
                <td className="py-3 px-3 border-b border-gray-300 text-gray-600">
                  {student.liceo?.nombre || student.rbd_liceo || 'N/A'}
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
                <td className="py-3 px-3 border-b border-gray-300 text-center text-sm">
                  <DateLabel fecha={student.ultimaEntrevista} modo="chileno" />
                </td>
                <td className="py-3 px-3 border-b border-gray-300 text-center font-bold">
                  {student.totalEntrevistasAno || 0}
                </td>
                <td className="py-3 px-3 border-b border-gray-300 text-center">
                  {tieneAlerta && (
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-sm border border-red-300"
                      title="Este estudiante tiene alertas activas"
                    >
                      !
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 border-b border-gray-300 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variante="primary"
                      tamano="sm"
                      onClick={() => onViewDetails(student.rut_estudiante)}
                      sx={{ alignSelf: 'center', flexShrink: 0 }}
                    >
                      Ver Detalles
                    </Button>
                    {canDelete && (
                      <Button
                        variante="danger"
                        tamano="sm"
                        onClick={() => onDelete(student.rut_estudiante)}
                        sx={{ alignSelf: 'center', flexShrink: 0 }}
                      >
                        Eliminar
                      </Button>
                    )}
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
