import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Estudiante } from '../types';
import { StudentsTable} from '../components';
import { useConfirmDialog } from '../components/ui';
import type { UIStudent } from './GeneracionView';
import { estudianteService } from '../services';

interface EstudiantesSectionProps {}

export const EstudiantesSection: React.FC<EstudiantesSectionProps> = () => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<keyof UIStudent>('apellido');
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
          await loadStudents();
        }
      });
    };

  const loadStudents = async () => {
      try {
        const estudiantesData = await estudianteService.getAll();
        setStudents(estudiantesData);
      } catch (error) {
        // silently fail - UI already handles empty state
      }
    };

  useEffect(() => {
  loadStudents();
  }, []);

  return (
    <>
      {/* Lista de Estudiantes */}
      <StudentsTable
          students={students}
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
