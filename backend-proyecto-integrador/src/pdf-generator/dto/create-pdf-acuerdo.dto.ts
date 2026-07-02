export class TopicoAcuerdoDto {
  nombre: string;
  puntos: string[];
}

export class CreatePdfAcuerdoDto {
  titulo: string;
  subtitulo: string;
  abstract: string;
  topicos: TopicoAcuerdoDto[];
  version: string;
}
