/* eslint-disable @typescript-eslint/no-explicit-any */
export const getEstudianteEmail     = (e: any): string => e?.email      ?? '';
export const getEstudianteTelefono  = (e: any): string => e?.telefono   ?? '';
export const getEstudianteDireccion = (e: any): string => e?.direccion  ?? '';
export const getEstudianteStatus    = (e: any): string => e?.estado     ?? '';
export const getEstudianteSemestre  = (e: any): string | null => e?.semestre ?? e?.semestre_actual ?? null;

export const getFamiliaNombreMadre  = (f: any): string    => f?.madre?.nombre          ?? '';
export const getFamiliaNombrePadre  = (f: any): string    => f?.padre?.nombre          ?? '';
export const getFamiliaDescripcionMadre          = (f: any): string    => f?.madre?.descripcion    ?? '';
export const getFamiliaDescripcionPadre          = (f: any): string    => f?.padre?.descripcion    ?? '';
export const getFamiliaHermanos                  = (f: any): unknown[] => f?.hermanos              ?? [];
export const getFamiliaOtrosFamiliares           = (f: any): unknown[] => f?.otros_familiares      ?? [];
export const getFamiliaObservacionesHermanos        = (f: any): string => f?.hermanos?.observaciones         ?? '';
export const getFamiliaObservacionesOtrosFamiliares = (f: any): string => f?.otros_familiares?.observaciones ?? '';

export const getRamoSemestre      = (r: any): number | null => r?.semestre   ?? r?.semestre_id ?? null;
export const getRamoAño           = (r: any): number | null => r?.año        ?? r?.year        ?? null;
export const getHistorialSemestre = (h: any): number | null => h?.semestre   ?? null;
export const getHistorialAño      = (h: any): number | null => h?.año        ?? null;
