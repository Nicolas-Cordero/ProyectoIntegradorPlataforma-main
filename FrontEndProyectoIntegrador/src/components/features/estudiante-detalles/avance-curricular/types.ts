import type { CarreraAvanceDto } from '../../../../services/carrera-avance.service';
import type { HistorialEstadoCarreraDto } from '../../../../services';
import type { EstadoRamoAvance } from '../../../../services/ramo-avance.service';
import type { TipoSemestre } from '../../../../services/semestre-avance.service';

export type CodigoSemUI = '1' | '2' | 'INVIERNO' | 'VERANO';

export interface RamoUI {
  id: number;
  nombre: string;
  estado: EstadoRamoAvance;
  comentario: string;
  intento: number;
  nota_final: number | null;
  url_certificado: string | null;
}

export interface SemestreUI {
  semestre_id: number;
  year: number;
  codigo: CodigoSemUI;
  tipo: TipoSemestre;
  ramos: RamoUI[];
  soloLocal: boolean;
  // Cierre explícito (backend, semestre_carrera.cerrado) — nunca derivado del
  // estado de los ramos. Solo cambia vía la acción de cierre del admin/tutor.
  cerrado: boolean;
}

export interface CarreraUI extends CarreraAvanceDto {
  semestres: SemestreUI[];
  cargando: boolean;
  error: string | null;
  historial: HistorialEstadoCarreraDto[];
  historialCargando: boolean;
}
