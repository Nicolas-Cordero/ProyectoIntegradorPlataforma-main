import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  authService, 
  estudianteService, 
  historialAcademicoService,
  estadoAcademicoService,
  informacionContactoService,
  informacionAcademicaService,
  beneficiosService,
  ramosCursadosService,
  institucionService
} from '../../../../services';
import type { Estudiante } from '../../../../types';
import { logger } from '../../../../config';

// Helpers para enriquecer los datos del estudiante con resumen académico
const getSemestrePorCalendario = () => (new Date().getMonth() <= 5 ? 1 : 2);

const calcularPromedioGeneral = (estudiante: any, infoAcademica: any) => {
  const promedioDirecto = Number(estudiante?.promedio);
  if (Number.isFinite(promedioDirecto) && promedioDirecto > 0) return promedioDirecto;

  // Primero, usar todas las notas finales disponibles en los semestres
  const resumenSemestres = infoAcademica?.resumen_semestres;
  if (Array.isArray(resumenSemestres) && resumenSemestres.length) {
    const notasRamos = resumenSemestres
      .flatMap((s: any) => Array.isArray(s?.ramos) ? s.ramos : [])
      .map((r: any) => Number(r?.promedio_final ?? r?.nota_final ?? r?.nota))
      .filter((n: number) => Number.isFinite(n) && n > 0);

    if (notasRamos.length > 0) {
      const suma = notasRamos.reduce((acc: number, val: number) => acc + val, 0);
      return Number((suma / notasRamos.length).toFixed(2));
    }

    const notasSemestres = resumenSemestres
      .map((s: any) => Number(s?.promedio_semestre))
      .filter((n: number) => Number.isFinite(n) && n > 0);
    if (notasSemestres.length > 0) {
      const suma = notasSemestres.reduce((acc: number, val: number) => acc + val, 0);
      return Number((suma / notasSemestres.length).toFixed(2));
    }
  }

  const promedios = [
    infoAcademica?.promedio_acumulado,
    infoAcademica?.promedio_1,
    infoAcademica?.promedio_2,
    infoAcademica?.promedio_3,
    infoAcademica?.promedio_4
  ].map(Number).filter((n) => Number.isFinite(n) && n > 0);

  if (promedios.length > 0) {
    const suma = promedios.reduce((acc, val) => acc + val, 0);
    return Number((suma / promedios.length).toFixed(2));
  }

  return 0;
};

const calcularSemestreActual = (estudiante: any, infoAcademica: any) => {
  const semestreDirecto = Number(estudiante?.semestre);
  if (Number.isFinite(semestreDirecto) && semestreDirecto > 0) return semestreDirecto;

  const resumenSemestres = infoAcademica?.resumen_semestres;
  if (Array.isArray(resumenSemestres) && resumenSemestres.length) {
    const maxSemestre = resumenSemestres.reduce((max: number, sem: any) => {
      const num = Number(sem?.semestre);
      return Number.isFinite(num) && num > max ? num : max;
    }, 0);
    if (maxSemestre > 0) return maxSemestre;
  }

  return getSemestrePorCalendario();
};

const obtenerBeca = (estudiante: any, infoAcademica: any, beneficiosActivos: any[]) => {
  if (estudiante?.beca) return estudiante.beca;
  if (infoAcademica?.beneficios) return infoAcademica.beneficios;

  if (Array.isArray(beneficiosActivos) && beneficiosActivos.length > 0) {
    const beneficio = beneficiosActivos[0];
    const nombre = beneficio?.beneficio?.nombre || beneficio?.nombre;
    if (nombre) return nombre;
    const tipo = beneficio?.beneficio?.tipo || beneficio?.tipo;
    if (tipo) return tipo;
  }

  return 'Sin beca';
};

const cargarInstitucionIfNeeded = async (data: any) => {
  try {
    // Si ya viene la relación completa, no hacer nada
    if (data?.institucion?.id_institucion) return data;

    const institucionId = data?.institucion_id || data?.id_institucion;
    if (!institucionId) return data;

    const institucion = await institucionService.getById(String(institucionId));
    if (institucion) {
      (data as any).institucion = institucion;
    }
  } catch (err) {
    logger.warn('⚠️ No se pudo cargar la institución asociada:', err);
  }
  return data;
};

const calcularPromedioDesdeRamos = (ramos: any[]) => {
  if (!Array.isArray(ramos)) return null;
  const notas = ramos
    .map((r) => Number(r?.promedio_final ?? r?.nota_final ?? r?.nota))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (notas.length === 0) return null;
  const suma = notas.reduce((acc, val) => acc + val, 0);
  return Number((suma / notas.length).toFixed(2));
};

export const useStudentData = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [informesGuardados, setInformesGuardados] = useState<any[]>([]);

  // Cargar datos del estudiante
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/');
      return;
    }
    
    const fetchEstudiante = async () => {
      if (!id) {
        setError('ID de estudiante no proporcionado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        logger.log('🔍 Cargando estudiante:', id);
        
        let data = await estudianteService.getById(id);
        data = await cargarInstitucionIfNeeded(data);
        
        // Cargar información adicional de las tablas refactorizadas
        let infoAcademica: any = null;
        let beneficiosActivos: any[] = [];
        let ramosCursados: any[] = [];

        try {
          const estadoAcademico = await estadoAcademicoService.getByEstudiante(id);
          if (estadoAcademico) {
            (data as any).status = estadoAcademico.status;
            (data as any).status_detalle = estadoAcademico.status_detalle;
          }
        } catch (err) {
          logger.warn('⚠️ No se pudo cargar estado académico:', err);
        }

        try {
          const contacto = await informacionContactoService.getByEstudiante(id);
          if (contacto) {
            (data as any).email = contacto.email;
            (data as any).telefono = contacto.telefono;
            (data as any).direccion = contacto.direccion;
          }
        } catch (err) {
          logger.warn('⚠️ No se pudo cargar información de contacto:', err);
        }

        // Cargar información académica siempre para asegurar datos frescos
        try {
          infoAcademica = await informacionAcademicaService.getByEstudiante(id);
          if (infoAcademica) {
            (data as any).informacionAcademica = infoAcademica;
          }
        } catch (err) {
          // Si falla (ej. NotFound), conservar cualquier infoAcademica que ya viniera en el payload
          logger.warn('⚠️ No se pudo cargar información académica:', err);
        }

        // Beneficios activos
        try {
          beneficiosActivos = await beneficiosService.getBeneficiosActivosEstudiante(id);
        } catch (err) {
          logger.warn('⚠️ No se pudo cargar beneficios activos:', err);
        }

        // Ramos cursados para alinear promedio con Avance Curricular
        try {
          ramosCursados = await ramosCursadosService.getByEstudiante(id);
        } catch (err) {
          logger.warn('⚠️ No se pudo cargar ramos cursados:', err);
        }

        // Enriquecer con resumen académico (promedio, semestre, beca)
        const promedioDesdeRamos = calcularPromedioDesdeRamos(ramosCursados);
        const promedioGeneral = promedioDesdeRamos ?? calcularPromedioGeneral(data, infoAcademica);
        const semestreActual = calcularSemestreActual(data, infoAcademica);
        const beca = obtenerBeca(data, infoAcademica, beneficiosActivos);

        (data as any).promedio = promedioGeneral;
        (data as any).semestre = semestreActual;
        (data as any).beca = beca;
        
        setEstudiante(data);
        
        logger.log('✅ Estudiante cargado:', data.nombre);
      } catch (err: any) {
        logger.error('❌ Error al cargar estudiante:', err);
        setError(err.message || 'Error al cargar el estudiante');
        setEstudiante(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEstudiante();
  }, [navigate, id]);

  // Cargar historial académico
  useEffect(() => {
    if (!id) return;

    const cargarHistorialAcademico = async () => {
      try {
        const historiales = await historialAcademicoService.getByEstudiante(id);
        setInformesGuardados(Array.isArray(historiales) ? historiales : []);
        logger.log('📂 Historial académico cargado:', Array.isArray(historiales) ? historiales.length : 0, 'registros');
      } catch (err) {
        logger.error('❌ Error al cargar historial académico:', err);
      }
    };

    cargarHistorialAcademico();
  }, [id]);

  // Recargar datos del estudiante
  const reloadStudentData = async () => {
    if (!id) return;

    try {
      logger.log('🔄 Recargando datos del estudiante...');
      let dataActualizada = await estudianteService.getById(id);
      dataActualizada = await cargarInstitucionIfNeeded(dataActualizada);
      
      // Recargar información adicional de las tablas refactorizadas
      let infoAcademica: any = null;
      let beneficiosActivos: any[] = [];
      let ramosCursados: any[] = [];

      try {
        const estadoAcademico = await estadoAcademicoService.getByEstudiante(id);
        if (estadoAcademico) {
          (dataActualizada as any).status = estadoAcademico.status;
          (dataActualizada as any).status_detalle = estadoAcademico.status_detalle;
        }
      } catch (err) {
        logger.warn('⚠️ No se pudo recargar estado académico:', err);
      }

      try {
        const contacto = await informacionContactoService.getByEstudiante(id);
        if (contacto) {
          (dataActualizada as any).email = contacto.email;
          (dataActualizada as any).telefono = contacto.telefono;
          (dataActualizada as any).direccion = contacto.direccion;
        }
      } catch (err) {
        logger.warn('⚠️ No se pudo recargar información de contacto:', err);
      }
      
      // Forzar recarga de información académica (siempre para obtener últimos datos)
      try {
        infoAcademica = await informacionAcademicaService.getByEstudiante(id);
        if (infoAcademica) {
          dataActualizada.informacionAcademica = infoAcademica;
        }
      } catch (err) {
        // Si falla, no sobrescribir lo que ya teníamos en memoria
        logger.warn('⚠️ No se pudo recargar información académica:', err);
      }

      try {
        beneficiosActivos = await beneficiosService.getBeneficiosActivosEstudiante(id);
      } catch (err) {
        logger.warn('⚠️ No se pudo recargar beneficios activos:', err);
      }

      try {
        ramosCursados = await ramosCursadosService.getByEstudiante(id);
      } catch (err) {
        logger.warn('⚠️ No se pudo recargar ramos cursados:', err);
      }

      const promedioDesdeRamos = calcularPromedioDesdeRamos(ramosCursados);
      const promedioGeneral = promedioDesdeRamos ?? calcularPromedioGeneral(dataActualizada, infoAcademica);
      const semestreActual = calcularSemestreActual(dataActualizada, infoAcademica);
      const beca = obtenerBeca(dataActualizada, infoAcademica, beneficiosActivos);

      (dataActualizada as any).promedio = promedioGeneral;
      (dataActualizada as any).semestre = semestreActual;
      (dataActualizada as any).beca = beca;
      
      setEstudiante(dataActualizada);
      logger.log('✅ Datos del estudiante recargados correctamente');
      logger.log('📊 Datos recargados:', {
        nombre: dataActualizada.nombre,
        email: (dataActualizada as any).email,
        telefono: (dataActualizada as any).telefono,
        direccion: (dataActualizada as any).direccion,
        status: (dataActualizada as any).status,
        informacionAcademica: dataActualizada.informacionAcademica ? 'Cargada' : 'No cargada',
        institucion: dataActualizada.institucion ? 'Cargada' : 'No cargada',
        promedio: (dataActualizada as any).promedio,
        semestre: (dataActualizada as any).semestre,
        beca: (dataActualizada as any).beca
      });
    } catch (err: any) {
      logger.error('❌ Error al recargar datos:', err);
      throw err;
    }
  };

  return {
    id,
    estudiante,
    setEstudiante,
    loading,
    error,
    informesGuardados,
    setInformesGuardados,
    reloadStudentData
  };
};