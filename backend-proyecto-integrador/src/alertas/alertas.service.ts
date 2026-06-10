import { Injectable } from '@nestjs/common';
import { AlertasRepository } from './alertas.repository';
import { Alerta, AlertaTipo } from './entities/alerta.entity';

const MS_POR_DIA = 1000 * 60 * 60 * 24;
const DIAS_LIMITE = 30;

@Injectable()
export class AlertasService {
  constructor(private readonly alertasRepository: AlertasRepository) {}

  async getAllAlertas(): Promise<Alerta[]> {
    const [estudiantes, entrevistas] = await Promise.all([
      this.alertasRepository.findAllEstudiantes(),
      this.alertasRepository.getAllEntrevistas(),
    ]);

    const alertas: Alerta[] = [];

    for (const est of estudiantes) {
      const entrevistasEst = entrevistas.filter(
        e => e.rut_estudiante === est.rut_estudiante,
      );

      if (entrevistasEst.length === 0) {
        alertas.push({
          rut_estudiante: est.rut_estudiante,
          tipo: AlertaTipo.ENTREVISTA_VENCIDA,
          message: 'Estudiante sin entrevista',
          created_at: new Date(),
        });
        continue;
      }

      const ultima = entrevistasEst.sort(
        (a, b) => b.fecha_hora.getTime() - a.fecha_hora.getTime(),
      )[0];
      const dias = Math.floor((Date.now() - ultima.fecha_hora.getTime()) / MS_POR_DIA);

      if (dias > DIAS_LIMITE) {
        alertas.push({
          rut_estudiante: est.rut_estudiante,
          tipo: AlertaTipo.ENTREVISTA_VENCIDA,
          message: `Estudiante sin entrevista hace más de ${dias} días`,
          created_at: new Date(),
        });
      }
    }

    return alertas;
  }

  async getAlertasByEstudiante(rut_estudiante: string): Promise<Alerta[]> {
    const entrevistas = await this.alertasRepository.getAllEntrevistasbyEstudiante(rut_estudiante);

    if (entrevistas.length === 0) {
      return [{
        tipo: AlertaTipo.ENTREVISTA_VENCIDA,
        message: 'Estudiante sin entrevista',
        created_at: new Date(),
      }];
    }

    const ultima = entrevistas.sort(
      (a, b) => b.fecha_hora.getTime() - a.fecha_hora.getTime(),
    )[0];
    const dias = Math.floor((Date.now() - ultima.fecha_hora.getTime()) / MS_POR_DIA);

    if (dias > DIAS_LIMITE) {
      return [{
        tipo: AlertaTipo.ENTREVISTA_VENCIDA,
        message: `Estudiante sin entrevista hace más de ${dias} días`,
        created_at: new Date(),
      }];
    }

    return [];
  }

  getAllAlertasByEstudiante(rut_estudiante: string): Promise<Alerta[]> {
    return this.getAlertasByEstudiante(rut_estudiante);
  }

  async getAlertasByGeneracion(generacion: string): Promise<Alerta[]> {
    const estudiantes = await this.alertasRepository.findAllEstudiantes();
    const filtrados = estudiantes.filter(e => e.generacion === generacion);

    const alertas: Alerta[] = [];

    for (const est of filtrados) {
      const entrevistas = await this.alertasRepository.getAllEntrevistasbyEstudiante(
        est.rut_estudiante,
      );

      if (entrevistas.length === 0) {
        alertas.push({
          rut_estudiante: est.rut_estudiante,
          tipo: AlertaTipo.ENTREVISTA_VENCIDA,
          message: 'Estudiante sin entrevista',
          created_at: new Date(),
        });
      }
    }

    return alertas;
  }
}
