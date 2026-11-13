import { Injectable } from '@nestjs/common';
import { EstadoRamo } from '@prisma/client';
import { Alerta, AlertaTipo } from './entities/alerta.entity';

const DIAS_AVISO_NOTAS = 30;

// Fecha de término de cada semestre (mes 0-indexado).
// La alerta de notas se dispara DIAS_AVISO_NOTAS días después de esta fecha.
const FIN_SEMESTRE: Record<string, { mes: number; dia: number }> = {
  PRIMER_SEMESTRE: { mes: 6, dia: 30 }, // 30 de julio
  SEGUNDO_SEMESTRE: { mes: 11, dia: 30 }, // 30 de diciembre
  INVIERNO: { mes: 7, dia: 30 }, // 30 de agosto
  VERANO: { mes: 2, dia: 0 }, // último día de febrero (28 o 29)
};

/**
 * Estados de un ramo que todavía espera su nota final. Un ELIMINADO no la
 * necesita, y un ramo ya evaluado sin nota (APROBADO/REPROBADO) es de los que
 * no se califican con nota: reclamársela sería una alerta permanente que nunca
 * se puede cerrar. El repositorio filtra con esta lista al consultar.
 */
export const ESTADOS_ESPERAN_NOTA: EstadoRamo[] = [
  EstadoRamo.CURSANDO,
  EstadoRamo.PENDIENTE,
];

/**
 * Ramo que espera nota final (estado en ESTADOS_ESPERAN_NOTA y sin
 * nota_final), con su semestre.
 */
export interface RamoSinNota {
  nombre: string;
  semestre: { year: number; semestre: string };
}

/**
 * Regla de negocio de la alerta de ausencia de notas finales.
 *
 * Es lógica pura, como la de entrevistas: el gestor (AlertasService) trae en
 * bloque los ramos sin nota y aquí solo se decide cuáles ya vencieron.
 */
@Injectable()
export class AlertaNotasService {
  /**
   * Genera una alerta por cada ramo que, pasados DIAS_AVISO_NOTAS días desde
   * el fin de su semestre, aún no tiene nota final.
   */
  evaluar(ramos: RamoSinNota[]): Alerta[] {
    return ramos
      .filter((ramo) => this.semestreVencidoHace30Dias(ramo.semestre))
      .map((ramo) => ({
        tipo: AlertaTipo.AUSENCIA_NOTAS,
        message: `Alumno sin nota final para ${ramo.nombre}`,
        created_at: new Date(),
      }));
  }

  private semestreVencidoHace30Dias(semestre: {
    year: number;
    semestre: string;
  }): boolean {
    const fin = FIN_SEMESTRE[semestre.semestre];
    if (!fin) {
      return false;
    }

    const limite = new Date(semestre.year, fin.mes, fin.dia);
    limite.setDate(limite.getDate() + DIAS_AVISO_NOTAS);

    return new Date() >= limite;
  }
}
