import { useState } from 'react';
import { historialAcademicoService, authService } from '../../../../services';
import { logger } from '../../../../config';

interface UseStudentSemestersProps {
  id?: string;
  estudiante: any;
  setInformesGuardados: (fn: (prev: any[]) => any[]) => void;
}

export const useStudentSemesters = ({ id, estudiante, setInformesGuardados }: UseStudentSemestersProps) => {
  const [mostrarModalNuevoSemestre, setMostrarModalNuevoSemestre] = useState(false);
  const [semestreSeleccionado, setSemestreSeleccionado] = useState<any>(null);
  const [mostrarModalDetalleSemestre, setMostrarModalDetalleSemestre] = useState(false);
  const [editandoSemestre, setEditandoSemestre] = useState(false);
  const [datosEditadosSemestre, setDatosEditadosSemestre] = useState<any>({});
  const [hayCambiosSemestre, setHayCambiosSemestre] = useState(false);
  
  // Estado para nuevo semestre
  const [nuevoSemestreData, setNuevoSemestreData] = useState({
    año: new Date().getFullYear(),
    semestre: new Date().getMonth() < 6 ? 1 : 2,
    nivel_educativo: '',
    ramos_aprobados: 0,
    ramos_reprobados: 0,
    ramos_eliminados: 0,
    promedio_semestre: 0,
    trayectoria_academica: [],
    observaciones: '',
  });

  // Crear nuevo semestre
  const handleCrearNuevoSemestre = async () => {
    if (!id || !estudiante) return;

    try {
      const usuario = authService.getCurrentUser();
      const historialData = {
        id_estudiante: id,
        año: nuevoSemestreData.año,
        semestre: nuevoSemestreData.semestre,
        nivel_educativo: nuevoSemestreData.nivel_educativo || estudiante.institucion?.nivel_educativo || 'Superior',
        ramos_aprobados: nuevoSemestreData.ramos_aprobados,
        ramos_reprobados: nuevoSemestreData.ramos_reprobados,
        ramos_eliminados: nuevoSemestreData.ramos_eliminados,
        promedio_semestre: nuevoSemestreData.promedio_semestre,
        trayectoria_academica: [],
        observaciones: nuevoSemestreData.observaciones || '',
         ultima_actualizacion_por: usuario?.email || (usuario as any)?.nombres || (usuario as any)?.id || 'usuario',
      };

      const response = await historialAcademicoService.create(historialData);
      
      const nuevoInforme = {
        ...(response || {}),
        fechaFormateada: new Date().toLocaleDateString('es-CL', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
      };

      setInformesGuardados(prev => [...prev, nuevoInforme]);
      
      // Limpiar formulario y cerrar modal
      setNuevoSemestreData({
        año: new Date().getFullYear(),
        semestre: new Date().getMonth() < 6 ? 1 : 2,
        nivel_educativo: '',
        ramos_aprobados: 0,
        ramos_reprobados: 0,
        ramos_eliminados: 0,
        promedio_semestre: 0,
        trayectoria_academica: [],
        observaciones: '',
      });
      setMostrarModalNuevoSemestre(false);
      
      logger.log('✅ Nuevo semestre creado:', nuevoInforme);
      alert(`✅ Nuevo semestre creado\nAño: ${historialData.año} | Semestre: ${historialData.semestre}`);
    } catch (err: any) {
      logger.error('❌ Error al crear semestre:', err);
      alert(`❌ Error al crear semestre: ${err.message}`);
    }
  };

  // Ver detalle de semestre
  const handleVerDetalleSemestre = (semestre: any) => {
    setSemestreSeleccionado(semestre);
    setMostrarModalDetalleSemestre(true);
    setEditandoSemestre(false);
    setDatosEditadosSemestre({});
  };

  // Seleccionar semestre (alias para compatibilidad)
  const handleSeleccionarSemestre = (historial: any) => {
    setSemestreSeleccionado(historial);
    setDatosEditadosSemestre({ ...historial });
    setMostrarModalDetalleSemestre(true);
    setEditandoSemestre(false);
  };

  // Guardar cambios de semestre
    const handleGuardarSemestre = async () => {
    if (!semestreSeleccionado) return;

    try {
      const usuario = authService.getCurrentUser();
      const datosActualizados = {
        año: datosEditadosSemestre.año,
        semestre: datosEditadosSemestre.semestre,
        nivel_educativo: datosEditadosSemestre.nivel_educativo,
        ramos_aprobados: datosEditadosSemestre.ramos_aprobados,
        ramos_reprobados: datosEditadosSemestre.ramos_reprobados,
        ramos_eliminados: datosEditadosSemestre.ramos_eliminados,
        promedio_semestre: datosEditadosSemestre.promedio_semestre,
        trayectoria_academica: datosEditadosSemestre.trayectoria_academica || [],
        observaciones: datosEditadosSemestre.observaciones,
         ultima_actualizacion_por: usuario?.email || (usuario as any)?.nombres || (usuario as any)?.id || 'usuario',
      };

      await historialAcademicoService.update(semestreSeleccionado.id_historial_academico, datosActualizados);
      
      // Actualizar la lista de semestres
      setInformesGuardados(prev => 
        prev.map(semestre => 
          semestre.id_historial_academico === semestreSeleccionado.id_historial_academico 
            ? { ...semestre, ...datosActualizados }
            : semestre
        )
      );
      
      // Actualizar semestre seleccionado
      setSemestreSeleccionado({ ...semestreSeleccionado, ...datosActualizados });
      setEditandoSemestre(false);
      
      logger.log('✅ Semestre actualizado:', datosActualizados);
      alert('✅ Semestre actualizado correctamente');
    } catch (err: any) {
      logger.error('❌ Error al actualizar semestre:', err);
      alert(`❌ Error al actualizar semestre: ${err.message}`);
    }
  };

  // Agregar comentario a la trayectoria académica
  const handleAgregarComentario = () => {
    const nuevoComentario = prompt('Ingrese un comentario:');
    if (nuevoComentario && nuevoComentario.trim()) {
      const comentarioConFecha = `${new Date().toLocaleDateString('es-CL')}: ${nuevoComentario.trim()}`;
      setDatosEditadosSemestre((prev: any) => ({
        ...prev,
        trayectoria_academica: [...(prev.trayectoria_academica || []), comentarioConFecha]
      }));
      setHayCambiosSemestre(true);
    }
  };

  // Eliminar comentario de la trayectoria académica
  const handleEliminarComentario = (index: number) => {
    if (confirm('¿Está seguro de eliminar este comentario?')) {
      setDatosEditadosSemestre((prev: any) => ({
        ...prev,
        trayectoria_academica: prev.trayectoria_academica.filter((_: any, i: number) => i !== index)
      }));
      setHayCambiosSemestre(true);
    }
  };

  // Activar edición de semestre
  const handleEditarSemestre = () => {
    setEditandoSemestre(true);
    setDatosEditadosSemestre({});
  };

  // Cancelar edición de semestre
  const handleCancelarEdicionSemestre = () => {
    setEditandoSemestre(false);
    setDatosEditadosSemestre({});
  };

  const registrarCambioSemestre = () => setHayCambiosSemestre(true);
  const limpiarCambiosSemestre = () => setHayCambiosSemestre(false);

  return {
    // Estados
    mostrarModalNuevoSemestre,
    setMostrarModalNuevoSemestre,
    semestreSeleccionado,
    setSemestreSeleccionado,
    mostrarModalDetalleSemestre,
    setMostrarModalDetalleSemestre,
    editandoSemestre,
    setEditandoSemestre,
    datosEditadosSemestre,
    setDatosEditadosSemestre,
    nuevoSemestreData,
    setNuevoSemestreData,
    hayCambiosSemestre,
    registrarCambioSemestre,
    limpiarCambiosSemestre,
    
    // Handlers
    handleCrearNuevoSemestre,
    handleVerDetalleSemestre,
    handleSeleccionarSemestre,
    handleEditarSemestre,
    handleCancelarEdicionSemestre,
    handleGuardarSemestre,
    handleAgregarComentario,
    handleEliminarComentario
  };
};