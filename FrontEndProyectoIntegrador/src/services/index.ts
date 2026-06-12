// Exportación centralizada de servicios
export { authService } from './authService';
export { estudianteService } from './estudiante.service';
// Cloudinary is used via direct upload from components using env vars
export { userService } from './user.service';
export { historialAcademicoService } from './historial-academico.service';
export { entrevistaService } from './entrevista.service';
export { ramosCursadosService } from './ramos-cursados.service';
export { default as PermissionService } from './permissionService';

// Nuevos servicios para entidades refactorizadas
export { informacionContactoService } from './informacion-contacto.service';
export { estadoAcademicoService } from './estado-academico.service';
export { familiarService } from './familiar.service';
export { periodoAcademicoService } from './periodo-academico.service';

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
