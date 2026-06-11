import { Injectable } from '@nestjs/common';
import { EstadoRamo } from '@prisma/client';
import { AlertasRepository } from './alertas.repository';
import { Alerta, AlertaTipo } from './entities/alerta.entity';

const MS_POR_DIA = 1000 * 60 * 60 * 24;
const DIAS_LIMITE = 30;

// Fecha de término de cada semestre (mes 0-indexado).
// La alerta de notas se dispara DIAS_AVISO_NOTAS días después de esta fecha.
const DIAS_AVISO_NOTAS = 30;
const FIN_SEMESTRE: Record<string, { mes: number; dia: number }> = {
  PRIMER_SEMESTRE: { mes: 6, dia: 30 }, // 30 de julio
  SEGUNDO_SEMESTRE: { mes: 11, dia: 30 }, // 30 de diciembre
  INVIERNO: { mes: 7, dia: 30 }, // 30 de agosto
  VERANO: { mes: 2, dia: 0 }, // último día de febrero (28 o 29)
};

interface RamoEstudiante {
  id: number;
  nombre: string;
  estado: EstadoRamo;
  codigo_carrera: number;
  rut_estudiante: string;
  nota_final?: unknown;
  semestre_id: number;
}

@Injectable()
export class AlertasService {
  constructor(private readonly alertasRepository: AlertasRepository) {}

  async getAllAlertas(): Promise<Alerta[]> {
    const [estudiantes, entrevistas] = await Promise.all([
      this.alertasRepository.findAllEstudiantes(),
      this.alertasRepository.getAllEntrevistas(),
    ]);

    const alertas: Alerta[] = [];

    for (const est of estudiantes ?? []) {
      if (entrevistas) {
        const entrevistasEst = entrevistas.filter(
          e => e.rut_estudiante === est.rut_estudiante,
        );
        const alertaEntrevista = this.alertaEntrevista(entrevistasEst);
        if (alertaEntrevista) {
          alertas.push({ rut_estudiante: est.rut_estudiante, ...alertaEntrevista });
        }
      }

      alertas.push(
        ...(await this.alertasNotas(est.rut_estudiante, {
          incluirRut: true,
          soloRamosDelEstudiante: false,
        })),
      );
    }

    return alertas;
  }

  async getAlertasByEstudiante(rut_estudiante: string): Promise<Alerta[]> {
    const alertas: Alerta[] = [];

    const entrevistas =
      await this.alertasRepository.getAllEntrevistasbyEstudiante(rut_estudiante);
    if (entrevistas) {
      const alertaEntrevista = this.alertaEntrevista(entrevistas);
      if (alertaEntrevista) {
        alertas.push(alertaEntrevista);
      }
    }

    alertas.push(
      ...(await this.alertasNotas(rut_estudiante, {
        incluirRut: false,
        soloRamosDelEstudiante: true,
      })),
    );

    return alertas;
  }

  getAllAlertasByEstudiante(rut_estudiante: string): Promise<Alerta[]> {
    return this.getAlertasByEstudiante(rut_estudiante);
  }

  async getAlertasByGeneracion(generacion: string): Promise<Alerta[]> {
    const estudiantes = (await this.alertasRepository.findAllEstudiantes()) ?? [];
    const filtrados = estudiantes.filter(e => e.generacion === generacion);

    const alertas: Alerta[] = [];

    for (const est of filtrados) {
      const entrevistas =
        await this.alertasRepository.getAllEntrevistasbyEstudiante(est.rut_estudiante);
      if (entrevistas) {
        const alertaEntrevista = this.alertaEntrevista(entrevistas);
        if (alertaEntrevista) {
          alertas.push({ rut_estudiante: est.rut_estudiante, ...alertaEntrevista });
        }
      }

      alertas.push(
        ...(await this.alertasNotas(est.rut_estudiante, {
          incluirRut: true,
          soloRamosDelEstudiante: true,
        })),
      );
    }

    return alertas;
  }

  private alertaEntrevista(entrevistas: { fecha_hora: Date }[]): Alerta | null {
    if (entrevistas.length === 0) {
      return {
        tipo: AlertaTipo.ENTREVISTA_VENCIDA,
        message: 'Estudiante sin entrevista',
        created_at: new Date(),
      };
    }

    const ultima = [...entrevistas].sort(
      (a, b) => b.fecha_hora.getTime() - a.fecha_hora.getTime(),
    )[0];
    const dias = Math.floor((Date.now() - ultima.fecha_hora.getTime()) / MS_POR_DIA);

    if (dias > DIAS_LIMITE) {
      return {
        tipo: AlertaTipo.ENTREVISTA_VENCIDA,
        message: `Estudiante sin entrevista hace más de ${dias} días`,
        created_at: new Date(),
      };
    }

    return null;
  }

  private async alertasNotas(
    rut_estudiante: string,
    opciones: { incluirRut: boolean; soloRamosDelEstudiante: boolean },
  ): Promise<Alerta[]> {
    const ramos: RamoEstudiante[] | undefined =
      await this.alertasRepository.getAllRamosbyEstudiante(rut_estudiante);
    if (!ramos) {
      return [];
    }

    const alertas: Alerta[] = [];

    for (const ramo of ramos) {
      if (opciones.soloRamosDelEstudiante && ramo.rut_estudiante !== rut_estudiante) {
        continue;
      }
      if (ramo.estado === EstadoRamo.ELIMINADO) {
        continue;
      }
      if (ramo.nota_final != null) {
        continue;
      }

      const semestre = await this.alertasRepository.getSemestreById(ramo.semestre_id);
      if (!semestre || !this.semestreVencidoHace30Dias(semestre)) {
        continue;
      }

      const alerta: Alerta = {
        tipo: AlertaTipo.AUSENCIA_NOTAS,
        message: `Alumno sin nota final para ${ramo.nombre}`,
        created_at: new Date(),
      };
      if (opciones.incluirRut) {
        alerta.rut_estudiante = ramo.rut_estudiante;
      }
      alertas.push(alerta);
    }

    return alertas;
  }

  private semestreVencidoHace30Dias(semestre: { year: number; semestre: string }): boolean {
    const fin = FIN_SEMESTRE[semestre.semestre];
    if (!fin) {
      return false;
    }

    const limite = new Date(semestre.year, fin.mes, fin.dia);
    limite.setDate(limite.getDate() + DIAS_AVISO_NOTAS);

    return new Date() >= limite;
  }
}
