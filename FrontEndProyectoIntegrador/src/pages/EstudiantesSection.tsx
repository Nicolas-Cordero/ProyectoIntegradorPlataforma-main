import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentsTable} from '../components';
import { useConfirmDialog } from '../components/ui';
import type { UIStudent } from './GeneracionView';
import { estudianteService } from '../services';

interface EstudiantesSectionProps {}

export const EstudiantesSection: React.FC<EstudiantesSectionProps> = () => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<keyof UIStudent>('apellidos');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [students, setStudents] = useState<UIStudent[]>([]);
  const { showConfirm, ConfirmDialog } = useConfirmDialog();

  const handleSort = (field: keyof UIStudent) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'apellidos':
          comparison = (a.nombre || '').localeCompare(b.nombre || '');
          break;

        case 'carrera':
          comparison = (a.carrera || '').localeCompare(b.carrera || '');
          break;

        case 'estado':
          comparison = (a.estado || '').localeCompare(b.estado || '');
          break;

        case 'promedio':
          comparison = (Number(a.promedio) || 0) - (Number(b.promedio) || 0);
          break;

        default:
          return 0;
      }

      return sortDirection === 'asc'
        ? comparison
        : -comparison;
    });
  }, [students, sortField, sortDirection]);

  const handleVerDetalles = (studentId: string | number) => {
    navigate(`/estudiante/${studentId}`);
  };

  const handleDeleteStudent = async (studentId: string | number) => {
    console.log('🗑️ Intentando eliminar estudiante:', studentId);
      showConfirm({
        title: 'Eliminar estudiante',
        message: '¿Seguro que deseas eliminar este estudiante? Esta acción no se puede deshacer.',
        confirmText: 'Eliminar',
        confirmColor: 'error',
        onConfirm: async () => {
          await estudianteService.delete(String(studentId));
          await loadStudents();
          console.log('🗑️ Estudiante eliminado:', studentId);
        }
      });
    };

  const loadStudents = async () => {
      try {
        const estudiantesData = await estudianteService.getAll();
        setStudents(estudiantesData);
      } catch (error) {
        console.error('Error al cargar estudiantes:', error);
      }
    };

  useEffect(() => {
  loadStudents();
  }, []);

  return (
    <>
      {/* Lista de Estudiantes */}
      <StudentsTable
          students={sortedStudents}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onViewDetails={handleVerDetalles}
          onDelete={handleDeleteStudent}
        />
        <ConfirmDialog/>
    </>
  );
};
