/**
 * Sección completa de Avance Curricular integrada en el panel del estudiante
 */
import React, { useState, useEffect } from 'react';
import type { Estudiante } from '../../../types';
import { ramosCursadosService, periodoAcademicoService } from '../../../services';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import Box from '@mui/material/Box';
import GridBase from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { 
  SemesterCard, 
  SubjectCard,
  EditSubjectModal,
  AddSubjectModal,
  SemesterModal,
  CreateSemesterModal 
} from '../avance-curricular';

const toIdOrUndefined = (value: unknown): string | number | undefined => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') return value;

  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const parsePeriodoTexto = (periodo?: string, numeroSemestre?: number) => {
  let año = new Date().getFullYear();
  let semestre = numeroSemestre || 1;

  if (periodo) {
    const match = periodo.match(/^(\d{4})-(\d+)/);
    if (match) {
      año = parseInt(match[1], 10);
      semestre = parseInt(match[2], 10);
    }
  }

  return { año, semestre };
};

const asignarSemestreFallback = (nombreRamo: string, index: number) => {
  const nombre = nombreRamo?.toLowerCase() || '';

  if (nombre.includes('calculo2') || nombre.includes('cálculo2') || nombre.includes('calculo 2')) {
    return { año: 2025, semestre: 1 };
  }
  if (nombre.includes('calculo3') || nombre.includes('cálculo3') || nombre.includes('calculo 3')) {
    return { año: 2025, semestre: 2 };
  }
  if (nombre.includes('calculo1') || nombre.includes('cálculo1') || nombre.includes('calculo 1')) {
    return { año: 2024, semestre: 2 };
  }
  if (nombre.includes('matemática') || nombre.includes('álgebra')) {
    return { año: 2024, semestre: 1 };
  }
  if (nombre.includes('física') || nombre.includes('química')) {
    return { año: 2024, semestre: 2 };
  }
  if (nombre.includes('programación') || nombre.includes('informática')) {
    return { año: 2025, semestre: 1 };
  }

  return { año: 2025, semestre: (index % 2) + 1 };
};

const obtenerSemestreRamo = (ramo: any, index: number) => {
  const periodo = ramo?.periodo_academico_estudiante?.periodo_academico;

  if (periodo?.año && periodo?.semestre) {
    return { año: Number(periodo.año), semestre: Number(periodo.semestre) };
  }

  if (ramo?.año && ramo?.semestre) {
    return { año: Number(ramo.año), semestre: Number(ramo.semestre) };
  }

  return asignarSemestreFallback(ramo?.nombre_ramo, index);
};

// Interfaces para avance curricular
interface MallaCurricular {
  semestre: number;
  año?: number;
  fechaInicio?: string;
  fechaFin?: string;
  periodo?: string;
  periodoKey?: string;
  periodoEstudianteId?: string | number;
  periodoId?: string | number;
  ramos: {
    id?: number;
    codigo: string;
    nombre: string;
    creditos: number;
    prerequisitos: string[];
    estado: 'pendiente' | 'cursando' | 'aprobado' | 'reprobado';
    nota?: number;
    oportunidad?: number;
    backendId?: number | string;
  }[];
}

interface ProgresoCurricular {
  totalCreditos: number;
  creditosAprobados: number;
  creditosPendientes: number;
  porcentajeAvance: number;
  semestreActual: number;
  promedioGeneral: number;
}

interface AvanceCurricularSectionProps {
  estudiante: Estudiante;
  modoEdicion?: boolean;
}

export const AvanceCurricularSection: React.FC<AvanceCurricularSectionProps> = ({ 
  estudiante,
  modoEdicion = false
}) => {
  // Usamos any para relajar la validación de props del Grid en este layout complejo
  const Grid = GridBase as any;
  // Estados
  const [progreso, setProgreso] = useState<ProgresoCurricular | null>(null);
  const [mallaCurricular, setMallaCurricular] = useState<MallaCurricular[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Estado para vista activa (pendiente de implementar)
  // const [vistaActiva, setVistaActiva] = useState<'malla' | 'progreso' | 'estadisticas'>('malla');
  
  // Estados para funcionalidad de edición
  const [editingSubject, setEditingSubject] = useState<MallaCurricular['ramos'][0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSemestre, setSelectedSemestre] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<MallaCurricular | null>(null);
  const [isCreateSemesterModalOpen, setIsCreateSemesterModalOpen] = useState(false);

  const asegurarPeriodoParaSemestre = async (
    periodoTexto?: string,
    numeroSemestre?: number
  ): Promise<{ periodoEstudianteId: string | number; periodoId: string | number; año: number; semestre: number }> => {
    const { año, semestre } = parsePeriodoTexto(periodoTexto, numeroSemestre);

    let periodo = null;
    try {
      periodo = await periodoAcademicoService.buscarPeriodo(año, semestre);
    } catch (err) {
      // Si no existe, crearlo
      periodo = await periodoAcademicoService.createPeriodo({ año, semestre });
    }

    const periodoId = toIdOrUndefined(
      (periodo as any)?.id_periodo_academico || (periodo as any)?.id
    );

    if (!periodoId) {
      throw new Error('No se pudo obtener el ID del período académico');
    }

    let periodoEstudianteId: string | number | undefined;
    try {
      const registros = await periodoAcademicoService.getByEstudiante(estudiante.id_estudiante.toString());
      const existente = registros.find(
        (r: any) =>
          r.periodo_academico_id === periodoId ||
          r.periodo_academico?.id_periodo_academico === periodoId ||
          r.periodo_academico?.id === periodoId
      );
      if (existente) {
        periodoEstudianteId = toIdOrUndefined(
          (existente as any).id_periodo_academico_estudiante ||
          (existente as any).id
        );
      }
    } catch (err) {
      // Ignorar y crear si no se pudo obtener
    }

    if (!periodoEstudianteId) {
      const creado = await periodoAcademicoService.create({
        estudiante_id: estudiante.id_estudiante.toString(),
        periodo_academico_id: periodoId,
      } as any);
      periodoEstudianteId = toIdOrUndefined(
        (creado as any).id_periodo_academico_estudiante ||
        (creado as any).id
      );
    }

    if (!periodoEstudianteId) {
      throw new Error('No se pudo obtener el vínculo periodo-estudiante');
    }

    return { periodoEstudianteId, periodoId, año, semestre };
  };

  // Cargar datos reales desde el backend
  const cargarDatosReales = async () => {
    try {
      // Obtener ramos cursados del estudiante
      const ramosReales = await ramosCursadosService.getByEstudiante(String(estudiante.id_estudiante));
      
      console.log('📥 Datos recibidos del backend:', ramosReales);
      
      if (ramosReales && ramosReales.length > 0) {
        // Agrupar ramos por semestre
        const semestreMap: { [key: string]: MallaCurricular } = {};
        
        ramosReales.forEach((ramo: any, index: number) => {
          console.log('🔄 Procesando ramo del backend:', ramo);

          const { año: añoPeriodo, semestre: semestrePeriodo } = obtenerSemestreRamo(ramo, index);
          const periodoBackend = ramo.periodo_academico_estudiante?.periodo_academico;
          const periodoKey = `${añoPeriodo}-${semestrePeriodo}`;

          const periodoEstudianteId = toIdOrUndefined(
            ramo.periodo_academico_estudiante_id ||
            ramo.periodo_academico_estudiante?.id_periodo_academico_estudiante ||
            ramo.periodo_academico_estudiante?.id
          );

          const periodoId = toIdOrUndefined(
            periodoBackend?.id_periodo_academico ||
            periodoBackend?.id ||
            ramo.periodo_academico_id
          );

          if (!semestreMap[periodoKey]) {
            semestreMap[periodoKey] = {
              semestre: semestrePeriodo,
              año: añoPeriodo,
              periodo: `${añoPeriodo}-${semestrePeriodo}`,
              periodoKey,
              periodoEstudianteId,
              periodoId,
              ramos: []
            };
          }
          
          const ramoMapeado = {
            id: ramo.id_ramo || Date.now() + Math.random(),
            codigo: ramo.codigo_ramo || 'SIN-CODIGO',
            nombre: ramo.nombre_ramo || 'Sin nombre',
            creditos: 6, // Valor por defecto, se puede ajustar
            prerequisitos: [],
            estado: ramo.estado || 'pendiente',
            nota: ramo.promedio_final || undefined,
            oportunidad: ramo.oportunidad || 1,
            semestre: semestrePeriodo,
            año: añoPeriodo,
            // Guardar referencia al ID original del backend
            backendId: ramo.id_ramo
          };
          
          console.log('✅ Ramo mapeado:', ramoMapeado);
          
          semestreMap[periodoKey].ramos.push(ramoMapeado);
        });
        
        // Convertir a array y ordenar
        const mallaCurricularReal = Object.values(semestreMap)
          .sort((a, b) => {
            if ((a.año ?? 0) !== (b.año ?? 0)) return (a.año ?? 0) - (b.año ?? 0);
            return a.semestre - b.semestre;
          });
        
        setMallaCurricular(mallaCurricularReal);
        if (mallaCurricularReal.length > 0) {
          setSelectedSemestre(mallaCurricularReal[0].periodoKey || mallaCurricularReal[0].periodo || '');
        }
        return mallaCurricularReal;
      } else {
        // Si no hay ramos, crear estructura vacía
        setMallaCurricular([]);
        setProgreso({
          totalCreditos: 0,
          creditosAprobados: 0,
          creditosPendientes: 0,
          porcentajeAvance: 0,
          semestreActual: 1,
          promedioGeneral: 0
        });
        return [];
      }
    } catch (error) {
      console.error('Error cargando datos reales:', error);
      // En caso de error, usar estructura vacía
      setMallaCurricular([]);
      setProgreso({
        totalCreditos: 0,
        creditosAprobados: 0,
        creditosPendientes: 0,
        porcentajeAvance: 0,
        semestreActual: 1,
        promedioGeneral: 0
      });
      return [];
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar datos reales desde el backend
        const mallaCargada = await cargarDatosReales();
        
        // Si se cargaron datos, recalcular el progreso
        if (mallaCargada && mallaCargada.length > 0) {
          // El progreso se calculará automáticamente en el useEffect del recalcularProgreso
        }
        
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos del avance curricular');
      } finally {
        setLoading(false);
      }
    };

    if (estudiante?.id_estudiante) {
      loadData();
    }
  }, [estudiante.id_estudiante]);

  // Recalcular progreso cuando cambie la malla curricular
  useEffect(() => {
    if (mallaCurricular.length > 0) {
      const totalCreditos = mallaCurricular.reduce((acc, sem) => acc + (sem.ramos.length * 4), 0);
      const creditosAprobados = mallaCurricular.reduce((acc, sem) => 
        acc + sem.ramos.filter(r => r.estado === 'aprobado').length * 4, 0);
      const creditosPendientes = totalCreditos - creditosAprobados;
      const porcentajeAvance = totalCreditos > 0 ? (creditosAprobados / totalCreditos) * 100 : 0;

      const notasFinales = mallaCurricular.flatMap(sem => 
        sem.ramos
          .map(r => Number(r.nota))
          .filter(n => Number.isFinite(n) && n > 0)
      );
      const promedioGeneral = notasFinales.length > 0
        ? notasFinales.reduce((sum, nota) => sum + nota, 0) / notasFinales.length
        : 0;

      setProgreso({
        totalCreditos,
        creditosAprobados,
        creditosPendientes,
        porcentajeAvance: Number(porcentajeAvance.toFixed(1)),
        semestreActual: mallaCurricular.length,
        promedioGeneral: Number(promedioGeneral.toFixed(2))
      });
    } else {
      // Si no hay datos, resetear progreso
      setProgreso({
        totalCreditos: 0,
        creditosAprobados: 0,
        creditosPendientes: 0,
        porcentajeAvance: 0,
        semestreActual: 1,
        promedioGeneral: 0
      });
    }
  }, [mallaCurricular]);

  // Funciones de manejo de datos
  const handleDragEnd = async (result: DropResult) => {
    if (!modoEdicion) return;

    const { destination, source, draggableId } = result;

    // Si no hay destino, no hacer nada
    if (!destination) {
      return;
    }

    // Si se soltó en la misma posición, no hacer nada
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      // Encontrar el ramo que se está moviendo
      const sourceKey = source.droppableId.replace('semestre-', '');
      const destKey = destination.droppableId.replace('semestre-', '');
      const [destAñoStr, destSemStr] = destKey.split('-');
      const destAño = Number(destAñoStr) || new Date().getFullYear();
      const destSemestreNum = Number(destSemStr) || 1;
      
      let ramoMovido: any = null;
      
      // Buscar el ramo en el semestre origen
      const semestreOrigen = mallaCurricular.find(s => s.periodoKey === sourceKey || s.periodo === sourceKey);
      if (semestreOrigen) {
        ramoMovido = semestreOrigen.ramos.find(r => String(r.backendId) === draggableId || r.codigo === draggableId);
      }

      if (!ramoMovido) {
        console.error('Ramo no encontrado:', draggableId);
        return;
      }

      console.log('🔄 Moviendo ramo:', {
        ramo: ramoMovido.nombre,
        desde: sourceKey,
        hacia: destKey,
        backendId: ramoMovido.backendId
      });

      // Actualizar localmente primero para UX inmediato
      setMallaCurricular(prev => {
        const newMalla = [...prev];
        
        // Remover del semestre origen
        const sourceIndex = newMalla.findIndex(s => s.periodoKey === sourceKey || s.periodo === sourceKey);
        if (sourceIndex !== -1) {
          newMalla[sourceIndex].ramos = newMalla[sourceIndex].ramos.filter((r) => {
            const rId = String(r.backendId ?? r.id ?? r.codigo);
            return rId !== draggableId;
          });
        }
        
        // Agregar al semestre destino
        const destIndex = newMalla.findIndex(s => s.periodoKey === destKey || s.periodo === destKey);
        if (destIndex !== -1) {
          const ramoActualizado = { ...ramoMovido, semestre: destSemestreNum, año: destAño };
          newMalla[destIndex].ramos.splice(destination.index, 0, ramoActualizado);
        }
        
        return newMalla;
      });

      // Actualizar en el backend si tiene backendId
      if (ramoMovido.backendId) {
        // Obtener/asegurar periodo para el semestre destino
        const semestreDestinoData = mallaCurricular.find(s => s.periodoKey === destKey || s.periodo === destKey);
        const periodoTextoDestino = semestreDestinoData?.periodo || `${destAño}-${destSemestreNum}`;
        const { periodoEstudianteId } = await asegurarPeriodoParaSemestre(
          periodoTextoDestino,
          destSemestreNum
        );

        const ramoData = {
          estado: ramoMovido.estado,
          promedio_final: ramoMovido.nota || null,
          oportunidad: ramoMovido.oportunidad || 1,
          periodo_academico_estudiante_id: periodoEstudianteId
        };

        console.log('📤 Actualizando ramo en backend:', {
          id: ramoMovido.backendId,
          data: ramoData
        });

        await ramosCursadosService.update(String(ramoMovido.backendId), ramoData as any);
        
        // Recargar datos para mantener sincronización
        await cargarDatosReales();
        showSnackbar(`${ramoMovido.nombre} movido al semestre ${destKey}`);
      } else {
        console.log('⚠️ Ramo sin backendId, solo actualización local');
        showSnackbar(`${ramoMovido.nombre} movido al semestre ${destKey} (local)`);
      }

    } catch (error) {
      console.error('Error moviendo ramo:', error);
      showSnackbar('Error al mover el ramo');
      // Recargar datos en caso de error para restaurar estado
      await cargarDatosReales();
    }
  };

  const handleAddSubject = (semestreKey: string) => {
    setSelectedSemestre(semestreKey);
    setIsAddModalOpen(true);
  };

  const handleEditSubject = (subject: MallaCurricular['ramos'][0]) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleCreateSemester = () => {
    setIsCreateSemesterModalOpen(true);
  };

  const handleSaveNewSemester = async (newSemesterData: {
    fechaInicio?: string;
    fechaFin?: string;
    periodo?: string;
  }) => {
    try {
      const numeroSemestre = mallaCurricular.length + 1;
      const periodoTexto = newSemesterData.periodo || `${new Date().getFullYear()}-${numeroSemestre}`;

      // Asegurar período académico y vínculo con el estudiante
      const { periodoEstudianteId, periodoId, año, semestre: semestreAsegurado } = await asegurarPeriodoParaSemestre(periodoTexto, numeroSemestre);

      const nuevoSemestre: MallaCurricular = {
        semestre: numeroSemestre,
        año,
        periodo: periodoTexto,
        periodoKey: `${año}-${semestreAsegurado ?? numeroSemestre}`,
        fechaInicio: newSemesterData.fechaInicio,
        fechaFin: newSemesterData.fechaFin,
        periodoEstudianteId,
        periodoId,
        ramos: []
      };

      setMallaCurricular(prev => [...prev, nuevoSemestre].sort((a, b) => {
        if ((a.año ?? 0) !== (b.año ?? 0)) return (a.año ?? 0) - (b.año ?? 0);
        return a.semestre - b.semestre;
      }));
      showSnackbar(`Semestre ${nuevoSemestre.semestre} creado correctamente`);
      setIsCreateSemesterModalOpen(false);
    } catch (error) {
      console.error('Error creando semestre:', error);
      showSnackbar('Error al crear el semestre');
    }
  };

  const handleSaveNewSubject = async (nuevoRamo: {
    nombre: string;
    creditos: number;
    prerequisitos: string[];
    estado: 'pendiente' | 'cursando' | 'aprobado' | 'reprobado';
    nota?: number;
  }) => {
    try {
      // Resolver periodo académico del semestre seleccionado
      const semestreSeleccionado = mallaCurricular.find(s => s.periodoKey === selectedSemestre || s.periodo === selectedSemestre);
      if (!semestreSeleccionado) {
        throw new Error('No se pudo determinar el semestre seleccionado');
      }
      const { periodoEstudianteId, periodoId, año, semestre: semestreAsegurado } = await asegurarPeriodoParaSemestre(
        semestreSeleccionado?.periodo,
        semestreSeleccionado?.semestre
      );

      const ramoData = {
        id_estudiante: estudiante.id_estudiante,
        periodo_academico_estudiante_id: periodoEstudianteId,
        codigo_ramo: `RAMO-${Date.now()}`,
        nombre_ramo: nuevoRamo.nombre,
        nivel_educativo: 'Universitario',
        notas_parciales: {},
        promedio_final: nuevoRamo.nota ?? null,
        estado: nuevoRamo.estado,
        oportunidad: 1,
      };
      
      console.log('📤 [AvanceCurricular] Enviando ramo al backend:', ramoData);

      try {
        // Llamada al backend
        const ramoCreado = await ramosCursadosService.create(ramoData as any);
        
        // Actualizar estado local con el ramo creado
        setMallaCurricular(prev => prev.map(semestreItem => {
          if (semestreItem.periodoKey === selectedSemestre || semestreItem.periodo === selectedSemestre) {
            return {
              ...semestreItem,
              periodoEstudianteId: periodoEstudianteId || semestreItem.periodoEstudianteId,
              periodoId: periodoId || semestreItem.periodoId,
              periodo: semestreItem.periodo || `${año}-${semestreAsegurado ?? semestreItem.semestre}`,
              ramos: [...semestreItem.ramos, {
                id: ramoCreado.id_ramo || Date.now(),
                codigo: ramoCreado.codigo_ramo || `RAMO-${Date.now()}`,
                nombre: nuevoRamo.nombre,
                creditos: nuevoRamo.creditos,
                prerequisitos: nuevoRamo.prerequisitos || [],
                estado: nuevoRamo.estado,
                nota: nuevoRamo.nota,
                backendId: ramoCreado.id_ramo,
                semestre: semestreAsegurado ?? semestreItem.semestre,
                año,
              }]
            };
          }
          return semestreItem;
        }));
      } catch (backendError) {
        // Si falla el backend, agregar localmente
        setMallaCurricular(prev => prev.map(semestreItem => {
          if (semestreItem.periodoKey === selectedSemestre || semestreItem.periodo === selectedSemestre) {
            return {
              ...semestreItem,
              periodoEstudianteId: semestreItem.periodoEstudianteId || periodoEstudianteId,
              periodoId: semestreItem.periodoId || periodoId,
              periodo: semestreItem.periodo || `${año}-${semestreAsegurado ?? semestreItem.semestre}`,
              ramos: [...semestreItem.ramos, {
                id: Date.now(),
                codigo: `LOCAL-${Date.now()}`,
                nombre: nuevoRamo.nombre,
                creditos: nuevoRamo.creditos,
                prerequisitos: nuevoRamo.prerequisitos || [],
                estado: nuevoRamo.estado,
                nota: nuevoRamo.nota,
                semestre: semestreAsegurado ?? semestreItem.semestre,
                año
              }]
            };
          }
          return semestreItem;
        }));
      }
      
      showSnackbar(`Ramo "${nuevoRamo.nombre}" agregado correctamente`);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error agregando ramo:', error);
      showSnackbar('Error al agregar el ramo');
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // Renderizar ramo con estilo similar al original
  const renderRamo = (ramo: MallaCurricular['ramos'][0], index: number) => {
    if (!ramo.codigo || !ramo.nombre) {
      return null;
    }

    const dragId = String(ramo.backendId ?? ramo.id ?? ramo.codigo ?? `ramo-${ramo.nombre}-${index}`);
    const dragKey = dragId;

    return (
      <Draggable
        key={dragKey}
        draggableId={dragId}
        index={index}
        isDragDisabled={!modoEdicion}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <SubjectCard 
              estado={ramo.estado}
              onClick={() => handleEditSubject(ramo)}
              sx={{
                transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                opacity: snapshot.isDragging ? 0.8 : 1,
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                }
              }}
            >
              <div className="subject-name">
                {ramo.nombre.toUpperCase()}
              </div>
              <div className="subject-footer">
                <span>NF: {ramo.nota || '-'}</span>
                <span>{ramo.creditos} SCT</span>
              </div>
              
              {/* Indicador de oportunidad */}
              {ramo.oportunidad && ramo.oportunidad > 1 && (
                <div className="opportunity-indicator">
                  {ramo.oportunidad}
                </div>
              )}
              
              {modoEdicion && (
                <IconButton
                  className="edit-button"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditSubject(ramo);
                  }}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </SubjectCard>
          </div>
        )}
      </Draggable>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando avance curricular...</p>
        </div>
      </div>
    );
  }

  if (error && mallaCurricular.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error al cargar datos</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      {progreso && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Avance Curricular</h2>
            <div className="flex gap-2">
              {modoEdicion && (
                <button
                  onClick={handleCreateSemester}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  ➕ Agregar Semestre
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {Math.floor(progreso.creditosAprobados / 4)}
              </div>
              <div className="text-sm text-gray-600">Ramos Aprobados</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.floor(progreso.creditosPendientes / 4)}
              </div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600 mb-2">
                {progreso.promedioGeneral}
              </div>
              <div className="text-sm text-gray-600">Promedio General</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {progreso.porcentajeAvance}%
              </div>
              <div className="text-sm text-gray-600">Avance</div>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progreso Curricular</span>
              <span>{progreso.porcentajeAvance}% completado</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progreso.porcentajeAvance}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Malla curricular por semestres */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Malla Curricular</h3>
          <p className="text-sm text-gray-600 mt-1">
            Organización de ramos por semestre
          </p>
        </div>
        
        <Box sx={{ p: 3 }}>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Grid container spacing={3}>
              {mallaCurricular.map((semestre) => {
                const key = semestre.periodoKey || semestre.periodo || `sem-${semestre.semestre}`;
                return (
                <Grid xs={12} md={6} lg={4} key={key}>
                  <SemesterCard>
                    <div className="semester-header">
                      <Typography className="semester-title" variant="h6">
                        Semestre {semestre.año ? `${semestre.año}/${semestre.semestre}S` : semestre.semestre}
                      </Typography>
                      {modoEdicion && (
                        <IconButton
                          className="semester-config-button"
                          size="small"
                          onClick={() => {
                            setEditingSemester(semestre);
                            setIsSemesterModalOpen(true);
                          }}
                        >
                          <SettingsIcon fontSize="small" />
                        </IconButton>
                      )}
                    </div>
                    
                    {semestre.periodo && (
                      <Typography variant="caption" className="semester-info" display="block" gutterBottom>
                        {semestre.periodo}
                      </Typography>
                    )}

                    <Droppable droppableId={`semestre-${key}`}>
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          style={{ minHeight: '200px', paddingBottom: '60px' }}
                        >
                          {semestre.ramos.map((ramo, index) => renderRamo(ramo, index))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>

                    {modoEdicion && (
                      <Fab
                        size="small"
                        color="primary"
                        onClick={() => handleAddSubject(key)}
                        sx={{
                          position: 'absolute',
                          bottom: 16,
                          right: 16,
                        }}
                      >
                        <AddIcon />
                      </Fab>
                    )}
                  </SemesterCard>
                </Grid>
              );
              })}
              
              {mallaCurricular.length === 0 && (
                <Grid xs={12}>
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      py: 8,
                      color: 'text.secondary'
                    }}
                  >
                    <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>📚</Typography>
                    <Typography variant="h6" gutterBottom>No hay semestres registrados</Typography>
                    <Typography variant="body2" sx={{ mb: 3 }}>
                      Agrega semestres y ramos para comenzar a gestionar el avance curricular
                    </Typography>
                    {modoEdicion ? (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateSemester}
                        sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
                      >
                        Crear Primer Semestre
                      </Button>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Activa el modo edición para crear el primer semestre
                      </Typography>
                    )}
                  </Box>
                </Grid>
              )}
            </Grid>
          </DragDropContext>
        </Box>
      </div>

      {/* Modales */}
      {isModalOpen && editingSubject && (
        <EditSubjectModal
          open={isModalOpen}
          ramo={editingSubject}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSubject(null);
          }}
          onSave={async (updatedSubject) => {
            try {
              console.log('🔄 Actualizando ramo:', {
                editingSubject,
                updatedSubject,
                backendId: editingSubject?.backendId
              });

              // Usar backendId si está disponible, sino usar id
              const idToUse = editingSubject?.backendId || (updatedSubject as any).id;
              
              if (idToUse) {
                const promedio = Number(updatedSubject.nota);
                const ramoData = {
                  estado: updatedSubject.estado,
                  promedio_final: Number.isFinite(promedio) ? promedio : undefined,
                  oportunidad: updatedSubject.oportunidad || 1
                };
                
                console.log('📤 Enviando actualización al backend:', {
                  id: String(idToUse),
                  data: ramoData
                });
                
                await ramosCursadosService.update(String(idToUse), ramoData);
                
                // Recargar todos los datos desde el backend para asegurar consistencia
                console.log('🔄 Recargando datos desde el backend...');
                await cargarDatosReales();
                
                showSnackbar('Ramo actualizado correctamente');
              } else {
                console.log('⚠️ No hay ID disponible, actualizando solo localmente');
                // Si no hay ID, solo actualizar localmente
                setMallaCurricular(prev => prev.map(semestre => ({
                  ...semestre,
                  ramos: semestre.ramos.map(ramo => 
                    ramo.id === editingSubject.id ? updatedSubject : ramo
                  )
                })));
                
                showSnackbar('Ramo actualizado localmente');
              }
              
              setIsModalOpen(false);
              setEditingSubject(null);
            } catch (error) {
              console.error('❌ Error actualizando ramo:', error);
              showSnackbar('Error al actualizar el ramo');
            }
          }}
        />
      )}

      {isAddModalOpen && (
        <AddSubjectModal
          open={isAddModalOpen}
          semestre={selectedSemestre}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveNewSubject}
        />
      )}

      {isCreateSemesterModalOpen && (
        <CreateSemesterModal
          open={isCreateSemesterModalOpen}
          currentMaxSemester={mallaCurricular.length}
          onClose={() => setIsCreateSemesterModalOpen(false)}
          onSave={handleSaveNewSemester}
        />
      )}

      {editingSemester && (
        <SemesterModal
          open={isSemesterModalOpen}
          semester={editingSemester}
          onClose={() => {
            setIsSemesterModalOpen(false);
            setEditingSemester(null);
          }}
          onSave={(updatedSemester) => {
            // Actualizar el semestre en la malla curricular
            setMallaCurricular(prev => prev.map(semestre => 
              semestre.semestre === updatedSemester.semestre ? updatedSemester : semestre
            ));
            
            showSnackbar('Semestre actualizado correctamente');
            setIsSemesterModalOpen(false);
            setEditingSemester(null);
          }}
          onDelete={(semesterNumber) => {
            // Eliminar semestre
            setMallaCurricular(prev => prev.filter(semestre => semestre.semestre !== semesterNumber));
            showSnackbar('Semestre eliminado correctamente');
            setIsSemesterModalOpen(false);
            setEditingSemester(null);
          }}
        />
      )}

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};