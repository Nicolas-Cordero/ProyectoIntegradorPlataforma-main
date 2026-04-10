export interface Observacion {
  fecha: string; // ISO date string
  contenido: string;
}

export interface ObservacionesFamiliares {
  madre: Observacion[];
  padre: Observacion[];
  hermanos: Observacion[];
  general: Observacion[]; 
}