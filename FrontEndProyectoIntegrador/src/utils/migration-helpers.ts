/**
 * MIGRATION HELPERS - FASE 1
 * 
 * Estos helpers temporales retornan valores por defecto para todos los campos
 * que fueron migrados a nuevas tablas en el backend.
 * 
 * En la FASE 2, estos helpers serán reemplazados por llamadas reales a los servicios:
 * - informacion-contacto.service.ts
 * - estado-academico.service.ts
 * - familiar.service.ts
 * - periodo-academico.service.ts
 * - informacion-admision.service.ts
 */

import type { Estudiante, Familia, RamosCursados, HistorialAcademico, InformacionAcademica } from '../types';

// === INFORMACIÓN DE CONTACTO ===
export const getEstudianteEmail = (estudiante: Estudiante): string => {
  // Verificar si existe el campo email en el objeto (cargado desde informacion_contacto)
  return (estudiante as any).email || '';
};

export const getEstudianteTelefono = (estudiante: Estudiante): string => {
  // Verificar si existe el campo telefono en el objeto (cargado desde informacion_contacto)
  return (estudiante as any).telefono || '';
};

export const getEstudianteDireccion = (estudiante: Estudiante): string => {
  // Verificar si existe el campo direccion en el objeto (cargado desde informacion_contacto)
  return (estudiante as any).direccion || '';
};

// === ESTADO ACADÉMICO ===
export const getEstudianteStatus = (estudiante: Estudiante): string => {
  // Verificar si existe el campo status en el objeto (cargado desde estado_academico)
  return (estudiante as any).status || 'Activo';
};

export const getEstudianteSemestre = (estudiante: Estudiante): number | undefined => {
  // Prioriza cualquier campo ya presente en el modelo antes de recurrir al servicio real
  const semestre =
    estudiante.semestre ??
    (estudiante as any).semestre_actual ??
    (estudiante as any).semestre_activo ??
    (estudiante as any)?.estadoAcademico?.semestre;

  if (semestre !== null && semestre !== undefined && semestre !== '') {
    const parsed = Number(semestre);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return undefined;
};

export const getEstudianteSemestresSuspendidos = (_estudiante: Estudiante): number => {
  // TODO: Llamar al servicio estado-academico.service.ts
  return 0;
};

export const getEstudianteSemestresCarrera = (_estudiante: Estudiante): number => {
  // TODO: Llamar al servicio estado-academico.service.ts
  return 10;
};

// === INFORMACIÓN FAMILIAR ===
export const getFamiliaNombreMadre = (_familia: Familia | undefined): string => {
  // TODO: Llamar al servicio familiar.service.ts
  return 'No registrada';
};

export const getFamiliaNombrePadre = (_familia: Familia | undefined): string => {
  // TODO: Llamar al servicio familiar.service.ts
  return 'No registrado';
};

export const getFamiliaHermanos = (_familia: Familia | undefined): unknown[] => {
  // TODO: Llamar al servicio familiar.service.ts
  return [];
};

export const getFamiliaOtrosFamiliares = (_familia: Familia | undefined): unknown[] => {
  // TODO: Llamar al servicio familiar.service.ts
  return [];
};

export const getFamiliaDescripcionMadre = (_familia: Familia | undefined): string => {
  // TODO: Llamar al servicio familiar.service.ts
  return '';
};

export const getFamiliaDescripcionPadre = (_familia: Familia | undefined): string => {
  // TODO: Llamar al servicio familiar.service.ts
  return '';
};

export const getFamiliaObservacionesHermanos = (_familia: Familia | undefined): string => {
  // TODO: Llamar al servicio familiar.service.ts
  return 'Sin información';
};

export const getFamiliaObservacionesOtrosFamiliares = (_familia: Familia | undefined): string => {
  // TODO: Llamar al servicio familiar.service.ts
  return 'Sin información';
};

export const getFamiliaObservacionesGenerales = (_familia: Familia | undefined): string => {
  // TODO: Llamar al servicio familiar.service.ts para obtener observaciones generales
  return 'Sin observaciones';
};

// === PERIODOS ACADÉMICOS (AÑO/SEMESTRE) ===
const parsePeriodoTexto = (periodo?: string): { año?: number; semestre?: number } => {
  if (!periodo || typeof periodo !== 'string') return {};
  const match = periodo.match(/^(\d{4})[-/](\d{1,2})/);
  if (!match) return {};
  return { año: Number(match[1]), semestre: Number(match[2]) };
};

export const getRamoSemestre = (ramo: RamosCursados): number | undefined => {
  const periodo = (ramo as any)?.periodo_academico_estudiante?.periodo_academico;
  const parsed = parsePeriodoTexto((ramo as any)?.periodo || (periodo as any)?.periodo);

  return (
    (periodo && (periodo as any).semestre) ||
    (ramo as any).semestre ||
    parsed.semestre ||
    undefined
  );
};

export const getRamoAño = (ramo: RamosCursados): number | undefined => {
  const periodo = (ramo as any)?.periodo_academico_estudiante?.periodo_academico;
  const parsed = parsePeriodoTexto((ramo as any)?.periodo || (periodo as any)?.periodo);

  return (
    (periodo && (periodo as any).año) ||
    (periodo && (periodo as any).anio) ||
    (ramo as any).año ||
    parsed.año ||
    undefined
  );
};

export const getHistorialSemestre = (_historial: HistorialAcademico): number | undefined => {
  // Usa el campo legacy directamente hasta migrar a periodo_academico
  return (_historial as any)?.semestre ?? undefined;
};

export const getHistorialAño = (_historial: HistorialAcademico): number | undefined => {
  // Usa el campo legacy directamente hasta migrar a periodo_academico
  return (_historial as any)?.año ?? undefined;
};

// === INFORMACIÓN ACADÉMICA ===
export const getInformacionAcademicaPuntajesAdmision = (
  _infoAcademica: InformacionAcademica | InformacionAcademica[] | undefined,
): Record<string, any> | undefined => {
  const infoAcademica = Array.isArray(_infoAcademica) ? _infoAcademica[0] : _infoAcademica;
  if (!infoAcademica) return undefined;

  // Soportar distintas fuentes: objeto json, string plano o campos específicos
  const puntajes = (infoAcademica as any).puntajes_admision || (infoAcademica as any).puntajes_paes;

  if (!puntajes) return undefined;

  if (typeof puntajes === 'string') {
    return { PAES: puntajes };
  }

  if (typeof puntajes === 'object') {
    return puntajes as Record<string, any>;
  }

  return undefined;
};

export const formatearPeriodo = (_año: number | undefined, _semestre: number | undefined): string => {
  if (!_año && !_semestre) return 'Sin período';
  if (_año && _semestre) return `${_año}-${_semestre}`;
  if (_año) return `${_año}`;
  return `Semestre ${_semestre}`;
};
