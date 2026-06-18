export class KpisEstadisticasDto {
  total:          number;
  activos:        number;
  titulados:      number;
  egresados:      number;
  retirados:      number;
  tasaDesercion:  number;
  nuevos:         number;
  nuevosAño:      number | null;
}

export class FilaEstadoDto {
  label: string;
  count: number;
  pct:   number;
}

export class FilaGeneroDto {
  label: string;
  count: number;
  pct:   number;
}

export class FilaGeneracionDto {
  año:   number;
  count: number;
}

export class FilaCohorteDto {
  año:    number;
  total:  number;
  counts: Record<string, number>;
}

export class CohorteDataDto {
  estados: string[];
  rows:    FilaCohorteDto[];
}

export class CreatePdfEstadisticasDto {
  kpis:           KpisEstadisticasDto;
  estadoData:     FilaEstadoDto[];
  generoData:     FilaGeneroDto[];
  porGeneracion:  FilaGeneracionDto[];
  cohorteData:    CohorteDataDto;
}
