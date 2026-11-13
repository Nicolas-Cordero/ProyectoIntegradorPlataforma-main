import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import {
  Visibility as VisibilityIcon,
  DeleteOutline as DeleteOutlineIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  UnfoldMore as UnfoldMoreIcon,
  WarningAmberRounded as WarningIcon,
} from '@mui/icons-material';
import { DateLabel } from '../../../components/ui';
import { ESTADO_CARRERA_CHIP } from '../../common/constants';
import { carrerasVisibles } from '../estudiantes/carrerasVisibles';
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

const TH = 'px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-stone-700 whitespace-nowrap';
const TD = 'px-3 py-3.5 align-middle';

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
  const anioActual = new Date().getFullYear();

  // Encabezado ordenable: un <button> dentro del <th> para que funcione con teclado.
  const thOrdenable = (field: keyof UIStudent, etiqueta: string, alineacion: 'left' | 'center') => {
    const activo = sortField === field;
    const Icono = !activo ? UnfoldMoreIcon : sortDirection === 'asc' ? ArrowUpwardIcon : ArrowDownwardIcon;
    return (
      <th
        scope="col"
        aria-sort={activo ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
        className={`${TH} ${alineacion === 'center' ? 'text-center' : 'text-left'}`}
      >
        <button
          type="button"
          onClick={() => onSort(field)}
          className={`inline-flex items-center gap-1 rounded uppercase tracking-wider transition-colors hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65B39B]/40 ${activo ? 'text-stone-950' : ''}`}
        >
          {etiqueta}
          <Icono aria-hidden="true" sx={{ fontSize: 14 }} className={activo ? 'text-[#4A9B7D]' : 'text-stone-400'} />
        </button>
      </th>
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-[#FAF8F3]">
            {thOrdenable('apellido', 'Nombre', 'left')}
            <th scope="col" className={`${TH} text-left`}>Institución</th>
            <th scope="col" className={`${TH} text-left`}>Carrera</th>
            {thOrdenable('estado', 'Estado', 'center')}
            {thOrdenable('ultimaEntrevista', 'Última entrevista', 'center')}
            <th scope="col" className={`${TH} text-center`}>Entrevistas {anioActual}</th>
            <th scope="col" className={`${TH} text-center`}>Alertas</th>
            <th scope="col" className={`${TH} text-center`}>
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        {students.map((student, index) => {
          const tieneAlerta = alertasSet.has(student.rut_estudiante);
          const carreras = carrerasVisibles(student);
          // Una fila por carrera visible (mínimo una) para que cada institución
          // quede alineada con su carrera aunque los nombres ocupen varias líneas;
          // el resto de las celdas abarca todas las filas con rowSpan.
          const filas = Math.max(carreras.length, 1);
          const chip = ESTADO_CARRERA_CHIP[student.estado];
          const nombreCompleto = `${student.nombre || ''} ${student.apellido || ''}`.trim();

          return (
            <tbody
              key={student.rut_estudiante || index}
              className="border-b border-stone-100 last:border-b-0 transition-colors hover:bg-[#65B39B]/[0.06]"
            >
              {Array.from({ length: filas }, (_, i) => {
                const carrera = carreras[i];
                const primera = i === 0;
                const ultima = i === filas - 1;
                // Las líneas de un mismo estudiante se compactan entre sí.
                const pad = `${primera ? 'pt-3.5' : 'pt-2 border-t border-dashed border-stone-200'} ${ultima ? 'pb-3.5' : 'pb-2'}`;

                return (
                  <tr key={carrera?.codigo_carrera ?? 'sin-carrera'}>
                    {primera && (
                      <td rowSpan={filas} className={TD}>
                        <div className="font-semibold text-stone-800 leading-snug">{nombreCompleto}</div>
                        <div className="mt-0.5 text-xs text-stone-500 tabular-nums">{student.rut_estudiante}</div>
                      </td>
                    )}
                    <td className={`px-3 ${pad} align-middle text-stone-600 leading-snug`}>
                      {carrera?.universidad?.nombre ?? <span className="text-stone-300">-</span>}
                    </td>
                    <td className={`px-3 ${pad} align-middle text-stone-800 leading-snug`}>
                      {carrera?.nombre ?? <span className="text-stone-300">-</span>}
                    </td>
                    {primera && (
                      <>
                        <td rowSpan={filas} className={`${TD} text-center`}>
                          <span
                            className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${chip ? `${chip.bg} ${chip.text}` : 'bg-stone-100 text-stone-700'}`}
                          >
                            {chip?.label ?? student.estado}
                          </span>
                        </td>
                        <td rowSpan={filas} className={`${TD} text-center whitespace-nowrap tabular-nums`}>
                          <DateLabel fecha={student.ultimaEntrevista} modo="chileno" className="justify-center" />
                        </td>
                        <td
                          rowSpan={filas}
                          className={`${TD} text-center tabular-nums font-semibold ${student.totalEntrevistasAno ? 'text-stone-800' : 'text-stone-300'}`}
                        >
                          {student.totalEntrevistasAno || 0}
                        </td>
                        <td rowSpan={filas} className={`${TD} text-center`}>
                          {tieneAlerta && (
                            <Tooltip title="Tiene alertas activas">
                              <span
                                role="img"
                                aria-label="Tiene alertas activas"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#C7654F]/10 text-[#C7654F]"
                              >
                                <WarningIcon sx={{ fontSize: 18 }} />
                              </span>
                            </Tooltip>
                          )}
                        </td>
                        <td rowSpan={filas} className={`${TD} text-center`}>
                          <div className="flex items-center justify-center gap-0.5">
                            <Tooltip title="Ver detalles">
                              <IconButton
                                size="small"
                                aria-label={`Ver detalles de ${nombreCompleto}`}
                                onClick={() => onViewDetails(student.rut_estudiante)}
                                sx={{ color: '#65B39B', '&:hover': { bgcolor: 'rgba(101, 179, 155, 0.12)' } }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {canDelete && (
                              <Tooltip title="Eliminar">
                                <IconButton
                                  size="small"
                                  aria-label={`Eliminar a ${nombreCompleto}`}
                                  onClick={() => onDelete(student.rut_estudiante)}
                                  sx={{ color: '#E74C3C', '&:hover': { bgcolor: 'rgba(231, 76, 60, 0.12)' } }}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          );
        })}
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
