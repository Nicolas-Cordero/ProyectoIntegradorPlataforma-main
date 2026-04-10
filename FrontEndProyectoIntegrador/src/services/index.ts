// Exportación centralizada de servicios
export { authService } from './authService';
export { estudianteService } from './estudiante.service';
// Cloudinary is used via direct upload from components using env vars
export { userService } from './user.service';
export { institucionService } from './institucion.service';
export { historialAcademicoService } from './historial-academico.service';
export { informacionAcademicaService } from './informacion-academica.service';
export { estadisticasService } from './estadisticas.service';
export { familiaService } from './familia.service';
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
export { informacionAdmisionService } from './informacion-admision.service';
