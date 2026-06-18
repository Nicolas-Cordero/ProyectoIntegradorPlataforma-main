type TipoSemestre = 'REGULAR' | 'RECUPERATIVO';
type CodigoSemestre = '1' | '2' | 'INVIERNO' | 'VERANO';
type EstadoRamo = 'APROBADO' | 'REPROBADO' | 'CURSANDO' | 'ELIMINADO';

export class RamoSemestreDto {
  nombre!:     string;
  nota_final!: number | null;
  intento!:    number;
  estado!:     EstadoRamo;
}

export class ResumenSemestreDto {
  aprobados!:  number;
  reprobados!: number;
  eliminados!: number;
  promedio!:   number | null;
}

export class CreatePdfSemestreDto {
  nombreEstudiante!: string;
  rutEstudiante!:    string;
  carrera!: {
    nombre: string;
  };
  semestre!: {
    year:    number;
    tipo:    TipoSemestre;
    codigo:  CodigoSemestre;
    abierto: boolean;
  };
  ramos!:    RamoSemestreDto[];
  resumen!:  ResumenSemestreDto;
}
