type TipoSemestre = 'REGULAR' | 'RECUPERATIVO';
type CodigoSemestre = '1' | '2' | 'INVIERNO' | 'VERANO';
type EstadoSemestre = 'EN_CURSO' | 'CERRADO' | 'SIN_RAMOS';

export class FilaSemestreAcademicoDto {
  year:         number;
  tipo:         TipoSemestre;
  codigo:       CodigoSemestre;
  estado:       EstadoSemestre;
  totalRamos:   number;
  aprobados:    number;
  reprobados:   number;
  eliminados:   number;
}

export class ResumenAcademicoDto {
  semFinalizados:   number;
  totalRamos:       number;
  ramosAprobados:   number;
  ramosReprobados:  number;
  ramosCursando:    number;
  ramosEliminados:  number;
  promedioGeneral:  number | null;
}

export class CreatePdfAcademicoDto {
  nombreEstudiante: string;
  rutEstudiante:    string;
  carrera: {
    nombre:       string;
    duracion_sem: number;
  };
  resumen:    ResumenAcademicoDto;
  semestres:  FilaSemestreAcademicoDto[];
}
