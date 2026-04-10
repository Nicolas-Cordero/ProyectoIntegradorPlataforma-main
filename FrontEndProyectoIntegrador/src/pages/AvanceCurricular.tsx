import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { estudianteService } from '../services';
import type { Estudiante } from '../types';
import {
  Box,
  Grid,
  Chip,
  Typography,
  LinearProgress,
  Tabs,
  Tab,
  IconButton,
  Button,
  Fab,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import {
  SemesterCard,
  SubjectCard,
  StatsCard,
  EditSubjectModal,
  AddSubjectModal,
  SemesterModal,
  CreateSemesterModal
} from '../components/features/avance-curricular';

//  INTERFACES PARA AVANCE CURRICULAR
interface MallaCurricular {
  semestre: number;
  fechaInicio?: string;
  fechaFin?: string;
  periodo?: string; // Ej: "2024-1", "2024-2"
  ramos: {
    id?: number;
    codigo: string;
    nombre: string;
    creditos: number;
    prerequisitos: string[];
    estado: 'pendiente' | 'cursando' | 'aprobado' | 'reprobado';
    nota?: number;
    oportunidad?: number;
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

export const AvanceCurricular: React.FC = () => {
  const navigate = useNavigate();
  const { id: estudianteId } = useParams();
  
  // ESTADOS
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null);
  const [progreso, setProgreso] = useState<ProgresoCurricular | null>(null);
  const [mallaCurricular, setMallaCurricular] = useState<MallaCurricular[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vistaActiva, setVistaActiva] = useState<'malla' | 'progreso' | 'estadisticas'>('malla');
  
  //  Estados para funcionalidad de edición
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSubject, setEditingSubject] = useState<MallaCurricular['ramos'][0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSemestre, setSelectedSemestre] = useState<number>(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<MallaCurricular | null>(null);
  const [isCreateSemesterModalOpen, setIsCreateSemesterModalOpen] = useState(false);

  // CARGAR DATOS DEL ESTUDIANTE
  useEffect(() => {
    const loadData = async () => {
      if (!authService.isAuthenticated()) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        
        // Cargar estudiante desde el backend
        const estudianteData = await estudianteService.getById(estudianteId || '0');
        setEstudiante(estudianteData);
        
        // Generar datos mock de avance curricular
        generateMockCurricularData();
        
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos del estudiante');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [estudianteId, navigate]);

  //  GENERAR DATOS MOCK DE MALLA CURRICULAR (Basada en Ingeniería Civil Informática)
  const generateMockCurricularData = () => {
    const mallaMock: MallaCurricular[] = [
      {
        semestre: 1,
        periodo: '2021-1',
        fechaInicio: '2021-03-01',
        fechaFin: '2021-07-30',
        ramos: [
          { codigo: 'DCCB-00106', nombre: 'CÁLCULO I', creditos: 6, prerequisitos: [], estado: 'aprobado', nota: 6.1 },
          { codigo: 'DCCB-00107', nombre: 'ÁLGEBRA I', creditos: 6, prerequisitos: [], estado: 'aprobado', nota: 6.4 },
          { codigo: 'DCCB-00119', nombre: 'INTRODUCCIÓN A LA FÍSICA', creditos: 6, prerequisitos: [], estado: 'aprobado', nota: 6.4 },
          { codigo: 'ECIN-00100', nombre: 'PR. INTRO. A LA INGENIERÍA', creditos: 5, prerequisitos: [], estado: 'aprobado', nota: 6.1 },
          { codigo: 'SSED-00102', nombre: 'COMUNICACIÓN EFECTIVA I', creditos: 2, prerequisitos: [], estado: 'aprobado', nota: 6.4 },
          { codigo: 'SSED-01184', nombre: 'INGLÉS I', creditos: 4, prerequisitos: [], estado: 'aprobado', nota: 5.4 },
        ]
      },
      {
        semestre: 2,
        periodo: '2021-2',
        fechaInicio: '2021-08-15',
        fechaFin: '2021-12-20',
        ramos: [
          { codigo: 'DCCB-00216', nombre: 'MECÁNICA', creditos: 6, prerequisitos: [], estado: 'aprobado', nota: 4.7 },
          { codigo: 'DCCB-00265', nombre: 'CÁLCULO II', creditos: 6, prerequisitos: ['DCCB-00106'], estado: 'aprobado', nota: 4.5 },
          { codigo: 'DCCB-00266', nombre: 'ÁLGEBRA II', creditos: 6, prerequisitos: ['DCCB-00107'], estado: 'aprobado', nota: 4.5 },
          { codigo: 'ECIN-00201', nombre: 'PROGRAMACIÓN', creditos: 6, prerequisitos: [], estado: 'aprobado', nota: 4.7 },
          { codigo: 'SSED-02184', nombre: 'INGLÉS 2', creditos: 4, prerequisitos: ['SSED-01184'], estado: 'aprobado', nota: 4.5 },
          { codigo: 'DCTE-00002', nombre: 'DIÁLOGO, FE Y CULTURA', creditos: 2, prerequisitos: [], estado: 'aprobado', nota: 5.5 },
        ]
      },
      {
        semestre: 3,
        ramos: [
          { codigo: 'DCCB-00264', nombre: 'QUÍMICA GENERAL', creditos: 6, prerequisitos: [], estado: 'cursando', nota: 5.2 },
          { codigo: 'DCCB-00301', nombre: 'ECUACIONES DIFERENCIALES', creditos: 5, prerequisitos: ['DCCB-00265'], estado: 'cursando', nota: 5.0 },
          { codigo: 'DCCB-00401', nombre: 'CÁLCULO III', creditos: 5, prerequisitos: ['DCCB-00266'], estado: 'cursando', nota: 4.0 },
          { codigo: 'ECIN-00307', nombre: 'PROGRAMACIÓN ORIENTADA A OBJET', creditos: 5, prerequisitos: ['ECIN-00201'], estado: 'cursando', nota: 5.0 },
          { codigo: 'ECIN-00308', nombre: 'TEC. Y MET. DE PROG. AVANZADA', creditos: 2, prerequisitos: ['ECIN-00201'], estado: 'cursando', nota: 5.0 },
          { codigo: 'SSED-02020', nombre: 'COMUNICACIÓN EFECTIVA II', creditos: 2, prerequisitos: ['SSED-00102'], estado: 'cursando', nota: 5.0 },
        ]
      },
      {
        semestre: 4,
        ramos: [
          { codigo: 'DCCB-00505', nombre: 'ELECTROMAGNETISMO', creditos: 6, prerequisitos: ['DCCB-00216'], estado: 'pendiente' },
          { codigo: 'ECIN-00336', nombre: 'ESTADÍSTICA', creditos: 6, prerequisitos: ['DCCB-00265'], estado: 'pendiente' },
          { codigo: 'ECIN-00407', nombre: 'ESTRUCTURAS DE DATOS', creditos: 5, prerequisitos: ['ECIN-00307'], estado: 'pendiente' },
          { codigo: 'ECIN-00408', nombre: 'PROYECTO DISEÑO E INNOVACIÓN', creditos: 4, prerequisitos: ['ECIN-00100'], estado: 'pendiente' },
          { codigo: 'ECIN-00800', nombre: 'ING. Y DESARROLLO SUSTENTABLE', creditos: 5, prerequisitos: [], estado: 'pendiente' },
          { codigo: 'ECIN-00098', nombre: 'EMPRENDIMIENTO', creditos: 3, prerequisitos: [], estado: 'pendiente' },
        ]
      },
      {
        semestre: 5,
        ramos: [
          { codigo: 'ECIN-00404', nombre: 'DISEÑO DE SISTEMAS DIGITALES', creditos: 5, prerequisitos: ['DCCB-00505'], estado: 'pendiente' },
          { codigo: 'ECIN-00507', nombre: 'BASES DE DATOS', creditos: 5, prerequisitos: ['ECIN-00407'], estado: 'pendiente' },
          { codigo: 'ECIN-00510', nombre: 'ELECTROTECNIA', creditos: 5, prerequisitos: ['DCCB-00505'], estado: 'pendiente' },
          { codigo: 'ECIN-00512', nombre: 'INTRODUCCIÓN A DATA SCIENCE', creditos: 5, prerequisitos: ['ECIN-00336'], estado: 'pendiente' },
          { codigo: 'ECIN-00513', nombre: 'PROV. INTEGRADOR PROG. AVANZADO', creditos: 5, prerequisitos: ['ECIN-00308'], estado: 'pendiente' },
          { codigo: 'ACNV-50001', nombre: 'FORMACIÓN CONVALIDACIÓN', creditos: 5, prerequisitos: [], estado: 'pendiente' },
        ]
      },
      {
        semestre: 6,
        ramos: [
          { codigo: 'ECIN-00506', nombre: 'FUNDAMENTOS DE LA COMPUTACIÓN', creditos: 5, prerequisitos: ['ECIN-00407'], estado: 'pendiente' },
          { codigo: 'ECIN-00508', nombre: 'ARQ. Y ORG. DE COMPUTADORES', creditos: 5, prerequisitos: ['ECIN-00404'], estado: 'pendiente' },
          { codigo: 'ECIN-00610', nombre: 'INGENIERÍA DE SOFTWARE', creditos: 5, prerequisitos: ['ECIN-00513'], estado: 'pendiente' },
          { codigo: 'ECIN-00618', nombre: 'INT. AL DESARROLLO WEB/MÓVIL', creditos: 5, prerequisitos: ['ECIN-00512'], estado: 'pendiente' },
          { codigo: 'ECIN-00619', nombre: 'PROYECTO INTEGRADOR...', creditos: 5, prerequisitos: ['ECIN-00510'], estado: 'pendiente' },
          { codigo: 'ACNV-60001', nombre: 'FORMACIÓN CONVALIDACIÓN', creditos: 5, prerequisitos: [], estado: 'pendiente' },
        ]
      },
      {
        semestre: 7,
        ramos: [
          { codigo: 'ECIN-00608', nombre: 'DISEÑO Y ANÁLISIS DE ALGORITMO', creditos: 5, prerequisitos: ['ECIN-00506'], estado: 'pendiente' },
          { codigo: 'ECIN-00609', nombre: 'LENGUAJES DE PROGRAMACIÓN', creditos: 5, prerequisitos: ['ECIN-00508'], estado: 'pendiente' },
          { codigo: 'ECIN-00706', nombre: 'SISTEMAS OPERATIVOS', creditos: 5, prerequisitos: ['ECIN-00610'], estado: 'pendiente' },
          { codigo: 'ECIN-00708', nombre: 'PROYECTO INTEGRADOR', creditos: 5, prerequisitos: ['ECIN-00618'], estado: 'pendiente' },
          { codigo: 'ECIN-00805', nombre: 'SISTEMAS DE INFORMACIÓN I', creditos: 5, prerequisitos: ['ECIN-00619'], estado: 'pendiente' },
          { codigo: 'ECIN-01330', nombre: 'POWER PLATFORM', creditos: 5, prerequisitos: [], estado: 'pendiente' },
        ]
      },
      {
        semestre: 8,
        ramos: [
          { codigo: 'ECIN-00705', nombre: 'GESTIÓN DE PROYECTOS TI', creditos: 5, prerequisitos: ['ECIN-00708'], estado: 'pendiente' },
          { codigo: 'ECIN-00806', nombre: 'REDES DE COMPUTADORES', creditos: 5, prerequisitos: ['ECIN-00706'], estado: 'pendiente' },
          { codigo: 'ECIN-00808', nombre: 'ARQUITECTURA DE SISTEMAS', creditos: 5, prerequisitos: ['ECIN-00805'], estado: 'pendiente' },
          { codigo: 'ECIN-00809', nombre: 'PROYECTO INTEGRADOR...', creditos: 5, prerequisitos: ['ECIN-00708'], estado: 'pendiente' },
          { codigo: 'ECIN-00907', nombre: 'SISTEMAS DE INFORMACIÓN II', creditos: 5, prerequisitos: ['ECIN-00805'], estado: 'pendiente' },
          { codigo: 'ECIN-00621', nombre: 'BASES DE DATOS NO RELACIONALES', creditos: 5, prerequisitos: ['ECIN-00507'], estado: 'pendiente' },
        ]
      },
      {
        semestre: 9,
        ramos: [
          { codigo: 'ECIN-00910', nombre: 'EVALUACIÓN DE PROYECTOS TI', creditos: 5, prerequisitos: ['ECIN-00705'], estado: 'pendiente' },
          { codigo: 'ECIN-00806', nombre: 'PRÁCTICA PRE PROFESIONAL', creditos: 12, prerequisitos: [], estado: 'pendiente' },
          { codigo: 'UNFP-90001', nombre: 'FORMACIÓN PROFESIONAL', creditos: 5, prerequisitos: [], estado: 'pendiente' },
          { codigo: 'UNFP-90002', nombre: 'FORMACIÓN PROFESIONAL', creditos: 5, prerequisitos: [], estado: 'pendiente' },
        ]
      },
      {
        semestre: 10,
        ramos: [
          { codigo: 'ECIN-01000', nombre: '', creditos: 0, prerequisitos: [], estado: 'pendiente' },
          { codigo: 'UNFP-90003', nombre: 'FORMACIÓN PROFESIONAL', creditos: 5, prerequisitos: [], estado: 'pendiente' },
          { codigo: 'UNFP-90004', nombre: 'FORMACIÓN PROFESIONAL', creditos: 5, prerequisitos: [], estado: 'pendiente' },
          { codigo: 'UNFP-90005', nombre: 'FORMACIÓN PROFESIONAL...', creditos: 5, prerequisitos: [], estado: 'pendiente' },
          { codigo: 'CAPSTONE', nombre: 'CAPSTONE PROJECT', creditos: 30, prerequisitos: [], estado: 'pendiente' },
        ]
      }
    ];

    // Calcular progreso
    let totalCreditos = 0;
    let creditosAprobados = 0;
    let notaSum = 0;
    let notaCount = 0;

    mallaMock.forEach(semestre => {
      semestre.ramos.forEach(ramo => {
        totalCreditos += ramo.creditos;
        if (ramo.estado === 'aprobado') {
          creditosAprobados += ramo.creditos;
          if (ramo.nota) {
            notaSum += ramo.nota;
            notaCount++;
          }
        }
      });
    });

    const progresoCalculado: ProgresoCurricular = {
      totalCreditos,
      creditosAprobados,
      creditosPendientes: totalCreditos - creditosAprobados,
      porcentajeAvance: Math.round((creditosAprobados / totalCreditos) * 100),
      semestreActual: 3,
      promedioGeneral: notaCount > 0 ? Math.round((notaSum / notaCount) * 10) / 10 : 0
    };

    setMallaCurricular(mallaMock);
    setProgreso(progresoCalculado);
  };

  //  RENDERIZAR RAMO CON ESTILO SIMILAR A LA IMAGEN
  const renderRamo = (ramo: MallaCurricular['ramos'][0], index: number) => {
    // Saltear materias vacías
    if (!ramo.codigo || !ramo.nombre) {
      return null;
    }

    return (
      <Draggable key={ramo.codigo} draggableId={ramo.codigo} index={index}>
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
              }}
            >
              <div className="subject-code">
                {ramo.codigo}
              </div>
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
              
              <IconButton
                className="edit-button"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditSubject(ramo);
                }}
                sx={{ position: 'absolute', top: 4, right: 4 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>

              <IconButton
                className="delete-button"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSubject(ramo.id || ramo.codigo);
                }}
                sx={{ position: 'absolute', top: 4, right: 34 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </SubjectCard>
          </div>
        )}
      </Draggable>
    );
  };

  // 🔢 FORMATEAR NÚMERO DE SEMESTRE
  const getNumeroSemestre = (num: number): string => {
    return `Semestre ${num}`;
  };

  // FUNCIONES DE EDICIÓN
  const handleEditSubject = (ramo: MallaCurricular['ramos'][0]) => {
    setEditingSubject(ramo);
    setIsModalOpen(true);
  };

  const handleSaveSubject = (ramoActualizado: MallaCurricular['ramos'][0]) => {
    setMallaCurricular(prev => prev.map(semestre => ({
      ...semestre,
      ramos: semestre.ramos.map(ramo => 
        ramo.codigo === ramoActualizado.codigo ? ramoActualizado : ramo
      )
    })));
    
    // Recalcular progreso
    recalcularProgreso();
    
    setSnackbarMessage('✅ Materia actualizada correctamente');
    setSnackbarOpen(true);
  };

  const handleAddSubject = (newSubject: any) => {
    const subjectWithId = {
      ...newSubject,
      id: Date.now(), // ID temporal
    };
    
    setMallaCurricular(prev => prev.map(semestre => 
      semestre.semestre === selectedSemestre 
        ? { ...semestre, ramos: [...semestre.ramos, subjectWithId] }
        : semestre
    ));
    
    recalcularProgreso();
    setIsAddModalOpen(false);
    setSnackbarMessage('✅ Materia agregada exitosamente');
    setSnackbarOpen(true);
  };

  const handleDeleteSubject = (identifier: number | string) => {
    setMallaCurricular(prev => prev.map(semestre => ({
      ...semestre,
      ramos: semestre.ramos.filter(ramo => 
        (typeof identifier === 'number' ? ramo.id : ramo.codigo) !== identifier
      )
    })));
    
    recalcularProgreso();
    setSnackbarMessage('✅ Materia eliminada exitosamente');
    setSnackbarOpen(true);
  };

  const openAddModal = (semestre: number) => {
    setSelectedSemestre(semestre);
    setIsAddModalOpen(true);
  };

  const handleEditSemester = (semester: MallaCurricular) => {
    setEditingSemester(semester);
    setIsSemesterModalOpen(true);
  };

  const handleSaveSemester = (updatedSemester: MallaCurricular) => {
    setMallaCurricular(prev => prev.map(semestre =>
      semestre.semestre === updatedSemester.semestre
        ? updatedSemester
        : semestre
    ));
    setIsSemesterModalOpen(false);
    setEditingSemester(null);
    setSnackbarMessage('✅ Semestre actualizado exitosamente');
    setSnackbarOpen(true);
  };

  const handleDeleteSemester = (semesterNumber: number) => {
    setMallaCurricular(prev => {
      // 1. Eliminar el semestre seleccionado
      const filteredSemesters = prev.filter(semestre => 
        semestre.semestre !== semesterNumber
      );
      
      // 2. Renumerar los semestres posteriores al eliminado
      const renumberedSemesters = filteredSemesters.map(semestre => {
        if (semestre.semestre > semesterNumber) {
          return {
            ...semestre,
            semestre: semestre.semestre - 1
          };
        }
        return semestre;
      });
      
      return renumberedSemesters;
    });
    
    setSnackbarMessage(`🗑️ Semestre ${semesterNumber} eliminado y semestres renumerados`);
    setSnackbarOpen(true);
  };

  const handleCreateSemester = (newSemesterData: { fechaInicio?: string; fechaFin?: string; periodo?: string; }) => {
    const nextSemesterNumber = Math.max(...mallaCurricular.map(s => s.semestre)) + 1;
    
    const newSemester: MallaCurricular = {
      semestre: nextSemesterNumber,
      ...newSemesterData,
      ramos: []
    };
    
    setMallaCurricular(prev => [...prev, newSemester].sort((a, b) => a.semestre - b.semestre));
    setIsCreateSemesterModalOpen(false);
    setSnackbarMessage(`✅ Semestre ${nextSemesterNumber} creado exitosamente`);
    setSnackbarOpen(true);
  };

  const openCreateSemesterModal = () => {
    setIsCreateSemesterModalOpen(true);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = parseInt(result.source.droppableId.replace('semestre-', ''));
    const destIndex = parseInt(result.destination.droppableId.replace('semestre-', ''));
    
    if (sourceIndex === destIndex) return; // No se movió a otro semestre

    const nuevaMalla = [...mallaCurricular];
    const ramoMovido = nuevaMalla[sourceIndex - 1].ramos[result.source.index];
    
    // Remover del semestre origen
    nuevaMalla[sourceIndex - 1].ramos.splice(result.source.index, 1);
    
    // Agregar al semestre destino
    nuevaMalla[destIndex - 1].ramos.splice(result.destination.index, 0, ramoMovido);
    
    setMallaCurricular(nuevaMalla);
    setSnackbarMessage(`📚 ${ramoMovido.codigo} movido al semestre ${destIndex}`);
    setSnackbarOpen(true);
  };

  const recalcularProgreso = () => {
    let totalCreditos = 0;
    let creditosAprobados = 0;
    let notaSum = 0;
    let notaCount = 0;

    mallaCurricular.forEach(semestre => {
      semestre.ramos.forEach(ramo => {
        totalCreditos += ramo.creditos;
        if (ramo.estado === 'aprobado') {
          creditosAprobados += ramo.creditos;
          if (ramo.nota) {
            notaSum += ramo.nota;
            notaCount++;
          }
        }
      });
    });

    const nuevoProgreso: ProgresoCurricular = {
      totalCreditos,
      creditosAprobados,
      creditosPendientes: totalCreditos - creditosAprobados,
      porcentajeAvance: Math.round((creditosAprobados / totalCreditos) * 100),
      semestreActual: 3,
      promedioGeneral: notaCount > 0 ? Math.round((notaSum / notaCount) * 10) / 10 : 0
    };

    setProgreso(nuevoProgreso);
  };

  // VISTA DE MALLA CURRICULAR CON DISEÑO TIPO TABLA
  const renderMallaCurricular = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ p: 3, position: 'relative' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ color: '#1f2937' }}>
            📚 Malla Curricular - Ingeniería Civil en Informática
          </Typography>
          <Fab
            color="primary"
            variant="extended"
            onClick={() => setIsEditMode(!isEditMode)}
            sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}
          >
            {isEditMode ? <SaveIcon sx={{ mr: 1 }} /> : <EditIcon sx={{ mr: 1 }} />}
            {isEditMode ? 'Guardar' : 'Editar'}
          </Fab>
        </Box>
        
        <Grid container spacing={1} sx={{ minHeight: '70vh' }}>
          {mallaCurricular.map((semestre) => (
            <Grid key={semestre.semestre} size={{ xs: 12, sm: 6, md: 4, lg: 2.4, xl: 1.2 }}>
              <SemesterCard>
                <div className="semester-header">
                  <div className="semester-title">
                    {getNumeroSemestre(semestre.semestre)}
                  </div>
                  {semestre.periodo && (
                    <div className="semester-info">
                      {semestre.periodo}
                    </div>
                  )}
                  
                  <IconButton
                    className="semester-config-button"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSemester(semestre);
                    }}
                  >
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                </div>
                <Droppable droppableId={`semestre-${semestre.semestre}`}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{ 
                        flex: 1,
                        backgroundColor: snapshot.isDraggingOver ? 'rgba(63, 81, 181, 0.1)' : 'transparent',
                        borderRadius: 1,
                        transition: 'background-color 0.2s ease',
                        minHeight: '200px',
                        p: 1,
                        position: 'relative'
                      }}
                    >
                      {semestre.ramos.map((ramo, index) => renderRamo(ramo, index))}
                      {provided.placeholder}
                      
                      <IconButton
                        className="add-subject-button"
                        onClick={() => openAddModal(semestre.semestre)}
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          bgcolor: 'success.main',
                          color: 'white',
                          width: 36,
                          height: 36,
                          '&:hover': {
                            bgcolor: 'success.dark',
                          },
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  )}
                </Droppable>
              </SemesterCard>
            </Grid>
          ))}
        </Grid>
      </Box>
    </DragDropContext>
  );

  // VISTA DE ESTADÍSTICAS CON MATERIAL-UI
  const renderEstadisticas = () => (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#1f2937' }}>
         Estadísticas Académicas
      </Typography>
      
      <Grid container spacing={3}>
        {/* Progreso General */}
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <StatsCard>
            <Typography variant="h6" sx={{ color: '#374151', mb: 2 }}>
               Progreso General
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#3b82f6', mb: 1 }}>
              {progreso?.porcentajeAvance}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progreso?.porcentajeAvance || 0} 
              sx={{ height: 8, borderRadius: 5 }}
            />
          </StatsCard>
        </Grid>

        {/* Promedio */}
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <StatsCard>
            <Typography variant="h6" sx={{ color: '#374151', mb: 2 }}>
               Promedio General
            </Typography>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 'bold', 
                color: (progreso?.promedioGeneral || 0) >= 5.0 ? '#10b981' : '#ef4444',
                mb: 1
              }}
            >
              {progreso?.promedioGeneral}
            </Typography>
            <Chip 
              label={(progreso?.promedioGeneral || 0) >= 5.0 ? 'Satisfactorio' : 'Necesita mejora'}
              color={(progreso?.promedioGeneral || 0) >= 5.0 ? 'success' : 'error'}
              size="small"
            />
          </StatsCard>
        </Grid>

        {/* Créditos */}
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <StatsCard>
            <Typography variant="h6" sx={{ color: '#374151', mb: 2 }}>
               Créditos
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', mb: 0.5 }}>
                <Typography variant="body2">Aprobados:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#10b981' }}>
                  {progreso?.creditosAprobados}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', mb: 0.5 }}>
                <Typography variant="body2">Pendientes:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f59e0b' }}>
                  {progreso?.creditosPendientes}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '14px', 
                pt: 1, 
                borderTop: '1px solid #e5e7eb' 
              }}>
                <Typography variant="body2">Total:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {progreso?.totalCreditos}
                </Typography>
              </Box>
            </Box>
          </StatsCard>
        </Grid>

        {/* Semestre Actual */}
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <StatsCard>
            <Typography variant="h6" sx={{ color: '#374151', mb: 2 }}>
               Semestre Actual
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#8b5cf6', mb: 1 }}>
              {progreso?.semestreActual}°
            </Typography>
            <Chip label="En curso" color="info" size="small" />
          </StatsCard>
        </Grid>
      </Grid>
    </Box>
  );

  //  ESTADOS DE CARGA Y ERROR
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFBF0'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h2>Cargando avance curricular...</h2>
        </div>
      </div>
    );
  }

  if (error || !estudiante) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFBF0'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2>Error al cargar</h2>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>{error}</p>
          <button 
            onClick={() => navigate(-1)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FFFBF0'
    }}>
      {/* HEADER */}
      <div style={{
        backgroundColor: '#FFFEF5',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => navigate(-1)}
              style={{
                padding: '0.5rem',
                backgroundColor: 'transparent',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              ← Volver
            </button>
            <div>
              <h1 style={{ margin: 0, color: '#1f2937' }}>🎓 Avance Curricular</h1>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                {estudiante.nombre} - {estudiante.rut}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateSemesterModal}
              sx={{
                backgroundColor: '#10b981',
                '&:hover': { backgroundColor: '#059669' },
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 'bold',
              }}
            >
              Agregar Semestre
            </Button>
            <div style={{ fontSize: '32px' }}>📊</div>
          </div>
        </div>
      </div>

      {/* NAVEGACIÓN DE PESTAÑAS CON MATERIAL-UI */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: '#FFFEF5' }}>
        <Tabs 
          value={vistaActiva} 
          onChange={(_, newValue) => setVistaActiva(newValue)}
          sx={{ px: 3 }}
        >
          <Tab value="malla" label="📋 Malla Curricular" />
          <Tab value="progreso" label="📊 Progreso" />
          <Tab value="estadisticas" label="📈 Estadísticas" />
        </Tabs>
      </Box>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ padding: '2rem' }}>
        {vistaActiva === 'malla' && renderMallaCurricular()}

        {vistaActiva === 'progreso' && progreso && (
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ mb: 3, color: '#1f2937' }}>
               Resumen de Progreso
            </Typography>
            
            <Grid container spacing={3}>
              {/* PROGRESO PRINCIPAL */}
              <Grid size={{ xs: 12, md: 6 }}>
                <StatsCard>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#3b82f6', mb: 1 }}>
                    {progreso.porcentajeAvance}%
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                    Avance total de la carrera
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progreso.porcentajeAvance} 
                    sx={{ height: 8, borderRadius: 5 }}
                  />
                </StatsCard>
              </Grid>

              {/* PROMEDIO GENERAL */}
              <Grid size={{ xs: 12, md: 6 }}>
                <StatsCard>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: progreso.promedioGeneral >= 5.0 ? '#10b981' : '#ef4444',
                      mb: 1
                    }}
                  >
                    {progreso.promedioGeneral}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280' }}>
                    Promedio General
                  </Typography>
                  <Chip 
                    label={progreso.promedioGeneral >= 5.0 ? 'Rendimiento Satisfactorio' : 'Necesita Mejora'}
                    color={progreso.promedioGeneral >= 5.0 ? 'success' : 'error'}
                    sx={{ mt: 1 }}
                  />
                </StatsCard>
              </Grid>

              {/* CRÉDITOS APROBADOS */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatsCard>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#10b981', mb: 1 }}>
                    {progreso.creditosAprobados}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280' }}>
                    Créditos Aprobados
                  </Typography>
                </StatsCard>
              </Grid>

              {/* CRÉDITOS PENDIENTES */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatsCard>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f59e0b', mb: 1 }}>
                    {progreso.creditosPendientes}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280' }}>
                    Créditos Pendientes
                  </Typography>
                </StatsCard>
              </Grid>

              {/* SEMESTRE ACTUAL */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatsCard>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#8b5cf6', mb: 1 }}>
                    {progreso.semestreActual}°
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280' }}>
                    Semestre Actual
                  </Typography>
                </StatsCard>
              </Grid>

              {/* TOTAL CRÉDITOS */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatsCard>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#374151', mb: 1 }}>
                    {progreso.totalCreditos}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280' }}>
                    Total Créditos
                  </Typography>
                </StatsCard>
              </Grid>
            </Grid>
          </Box>
        )}

        {vistaActiva === 'estadisticas' && renderEstadisticas()}
      </div>

      {/* MODAL DE EDICIÓN */}
      <EditSubjectModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ramo={editingSubject}
        onSave={handleSaveSubject}
      />

      {/* MODAL DE AGREGAR MATERIA */}
      <AddSubjectModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddSubject}
        semestre={selectedSemestre}
      />

      {/* MODAL DE CONFIGURAR SEMESTRE */}
      <SemesterModal
        open={isSemesterModalOpen}
        onClose={() => setIsSemesterModalOpen(false)}
        semester={editingSemester}
        onSave={handleSaveSemester}
        onDelete={handleDeleteSemester}
      />

      {/* MODAL DE CREAR SEMESTRE */}
      <CreateSemesterModal
        open={isCreateSemesterModalOpen}
        onClose={() => setIsCreateSemesterModalOpen(false)}
        onSave={handleCreateSemester}
        currentMaxSemester={Math.max(...mallaCurricular.map(s => s.semestre), 0)}
      />

      {/*  NOTIFICACIONES */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success"
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};