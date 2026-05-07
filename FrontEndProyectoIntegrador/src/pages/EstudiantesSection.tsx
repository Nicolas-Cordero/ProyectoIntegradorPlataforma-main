import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentFilterPanel, StudentsTable} from '../components';
import { useConfirmDialog } from '../components/ui';
import type { UIStudent } from './GeneracionView';
import { entrevistaService, estudianteService, historialAcademicoService, ramosCursadosService } from '../services';
import type { Estudiante } from '../types';
import { daysSince } from '../utils/dateHelpers';
import { getEstudianteStatus } from '../utils/migration-helpers';

interface EstudiantesSectionProps {}

export const EstudiantesSection: React.FC<EstudiantesSectionProps> = () => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<keyof UIStudent>('apellidos');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [students, setStudents] = useState<UIStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCarrera, setFilterCarrera] = useState<string>('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const { showConfirm, ConfirmDialog } = useConfirmDialog();


  const carreras = [...new Set(students.map(student => 
    student.carrera || student.institucion?.carrera_especialidad || 'Sin carrera'
  ).filter(Boolean))];
  const estados = [...new Set(students.map(student => 
    student.estado || 'Activo'
  ))];

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

  const normalizeNumber = (value?: number | string | null) => {
    if (value === null || value === undefined) return undefined;

    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;

    const cleaned = String(value).replace(',', '.').trim();
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : undefined;
  };

  const calculatePromedio = (
    student: Estudiante,
    historiales: any[],
    ramos: any[]
  ): number | undefined => {
    const directo =
      normalizeNumber(student.promedio) ??
      normalizeNumber(student.informacionAcademica?.promedio_acumulado) ??
      normalizeNumber(student.informacionAcademica?.promedio_1);

    if (directo !== undefined) return directo;

    const historialesConPromedio = historiales.filter(
      (h) => normalizeNumber(h?.promedio_semestre) !== undefined
    );
    if (historialesConPromedio.length > 0) {
      const suma = historialesConPromedio.reduce(
        (acc, h) => acc + (normalizeNumber(h.promedio_semestre) || 0),
        0
      );
      const promedio = suma / historialesConPromedio.length;
      if (Number.isFinite(promedio)) return promedio;
    }

    const ramosConNota = ramos.filter(
      (r) => normalizeNumber(r?.promedio_final) !== undefined
    );
    if (ramosConNota.length > 0) {
      const suma = ramosConNota.reduce(
        (acc, r) => acc + (normalizeNumber(r.promedio_final) || 0),
        0
      );
      const promedio = suma / ramosConNota.length;
      if (Number.isFinite(promedio)) return promedio;
    }

    return undefined;
  };

  const enrichStudentsWithStats = useCallback(async (rawStudents: Estudiante[]): Promise<UIStudent[]> => {
      const currentYear = new Date().getFullYear();
  
      return Promise.all(
        rawStudents.map(async (student) => {
          const studentId = String((student as any).id_estudiante || student.id || '');
  
          if (!studentId) {
            return {
              ...student,
              promedio: normalizeNumber(student.promedio),
              totalEntrevistasAno: 0,
            };
          }
  
          const [entrevistas, historiales, ramos] = await Promise.all([
            entrevistaService.getByEstudiante(studentId).catch((error) => {
              console.warn('⚠️ No se pudieron cargar entrevistas del estudiante', { studentId, error });
              return [];
            }),
            student.historialesAcademicos && student.historialesAcademicos.length > 0
              ? Promise.resolve(student.historialesAcademicos)
              : historialAcademicoService.getByEstudiante(studentId).catch((error) => {
                  console.warn('⚠️ No se pudo cargar historial académico del estudiante', { studentId, error });
                  return [];
                }),
            student.ramosCursados && student.ramosCursados.length > 0
              ? Promise.resolve(student.ramosCursados)
              : ramosCursadosService.getByEstudiante(studentId).catch((error) => {
                  console.warn('⚠️ No se pudieron cargar ramos cursados del estudiante', { studentId, error });
                  return [];
                }),
          ]);
  
          const entrevistasList = Array.isArray(entrevistas) ? entrevistas : [];
          const historialesList = Array.isArray(historiales) ? historiales : historiales ? [historiales] : [];
          const ramosList = Array.isArray(ramos) ? ramos : [];
  
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
  
          const promedioCalculado = calculatePromedio(student, historialesList, ramosList);
          const tienePendienteNotas = ramosList.some(
            (ramo) => normalizeNumber(ramo?.promedio_final) === undefined
          );
  
          return {
            ...student,
            promedio: promedioCalculado ?? normalizeNumber(student.promedio),
            ultimaEntrevista,
            totalEntrevistasAno,
            diasSinEntrevista,
            tienePendienteNotas,
          };
        })
      );
    }, []);

  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter(async student => {
      console.log("Filtrando estudiante:", student);
      const nombre = student.nombre || student.nombres || '';
      const apellido = student.apellidos || '';
      const rut = student.rut || '';
      const carrera = student.carrera || student.institucion?.carrera_especialidad || '';
      const id = String((student as any).id_estudiante || student.id || '');
      console.log(await estudianteService.getById(id));
      const estado = student.estado || getEstudianteStatus(await estudianteService.getById(id)) || 'Activo';
      
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

    return filtered;
  }, [students, searchTerm, filterCarrera, filterEstado, sortField, sortDirection]);  

  const loadStudents = useCallback(async () => {
      try {
        const dataStudents = await estudianteService.getAll();
        const studentsWithStats = await enrichStudentsWithStats(dataStudents);
        setStudents(studentsWithStats);
        console.log('✅ Estudiantes cargados:', dataStudents.length);
        
        if (dataStudents.length === 0) {
        }
      } catch (error) {
        console.error('❌ Error al cargar estudiantes de generación:', error);
        setStudents([]);
      }
    }, [enrichStudentsWithStats]);

  useEffect(() => {
    loadStudents();
  }, []);

  return (
    <>
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

              
      {/* Lista de Estudiantes */}
      <StudentsTable
          students={filteredAndSortedStudents}
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
