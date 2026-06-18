// Podemos observar una firma que recibe un DTO desconocido y devuelve un buffer
// EL DTO desconocido será firmado en cada servide.
export interface IPdfGenerator<T = unknown> {
  pdfGenerate(dto: T): Promise<Buffer>;
}


export enum Generators {
  ACADEMICO    = 'academico_generator',
  ENTREVISTA   = 'entrevista_generator',
  SEMESTRE     = 'semestre_generator',
  ESTADISTICAS = 'estadisticas_generator',
  ACUERDO      = 'acuerdo_generator',
}