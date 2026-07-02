// Exportación centralizada de servicios
export { authService } from './authService';
export { estudianteService } from './estudiante.service';
export { userService } from './user.service';
export { entrevistaService } from './entrevista.service';
export { comentarioService } from './comentario.service';
export { default as PermissionService } from './permissionService';
export { familiarService } from './familiar.service';

// Servicios para nuevas entidades
export { beneficiosService } from './beneficios.service';
export { liceoService } from './liceo.service';

// Avance curricular
export { universidadService } from './universidad.service';
export { carreraAvanceService } from './carrera-avance.service';
export { semestreAvanceService } from './semestre-avance.service';
export { ramoAvanceService } from './ramo-avance.service';

// Alertas
export { alertasService } from './alertas.service';
export type { Alerta } from './alertas.service';

// PAES
export { paesService } from './paes.service';
export type { CreatePaesDto, UpdatePaesDto } from './paes.service';

// Acuerdo de compromiso
export { acuerdoService } from './acuerdo.service';
export type {
  AcuerdoResponse,
  DocumentoCompromiso,
  TopicoCompromiso,
  UpdateAcuerdoDto,
} from './acuerdo.service';

// Storage
export { storageService } from './storage.service';

// Historial de estado de carrera
export { historialEstadoCarreraService } from './historial-estado-carrera.service';
export type { HistorialEstadoCarreraDto } from './historial-estado-carrera.service';
