import { Injectable } from '@nestjs/common';
import { AlertasRepository } from './alertas.repository';
import { AlertaEntrevistaService } from './alerta-entrevista.service';
import { AlertaNotasService } from './alerta-notas.service';
import { AlertaAcuerdoService } from './alerta-acuerdo.service';
import { Alerta } from './entities/alerta.entity';

/**
 * Gestor de alertas: orquesta los distintos tipos de alerta (entrevistas,
 * notas y firma del acuerdo). Decide qué estudiantes evaluar y cómo traer los
 * datos; las reglas de cada tipo viven en su propio servicio.
 *
 * Para sumar un nuevo tipo basta con inyectar su servicio y llamarlo dentro de
 * cada recorrido de estudiantes.
 */
@Injectable()
export class AlertasService {
  constructor(
    private readonly alertasRepository: AlertasRepository,
    private readonly alertaEntrevista: AlertaEntrevistaService,
    private readonly alertaNotas: AlertaNotasService,
    private readonly alertaAcuerdo: AlertaAcuerdoService,
  ) {}

  async getAllAlertas(): Promise<Alerta[]> {
    const [estudiantes, entrevistas] = await Promise.all([
      this.alertasRepository.findAllEstudiantes(),
      this.alertasRepository.getAllEntrevistas(),
    ]);

    // El acuerdo vigente es global: se resuelve una vez y las firmas se traen
    // en bloque para no consultar por cada estudiante.
    const { acuerdoVigente, rutsFirmantes } = await this.cargarContextoAcuerdo();

    const alertas: Alerta[] = [];

    for (const est of estudiantes ?? []) {
      if (entrevistas) {
        const entrevistasEst = entrevistas.filter(
          e => e.rut_estudiante === est.rut_estudiante,
        );
        const alertaEntrevista = this.alertaEntrevista.evaluar(entrevistasEst);
        if (alertaEntrevista) {
          alertas.push({ rut_estudiante: est.rut_estudiante, ...alertaEntrevista });
        }
      }

      alertas.push(
        ...(await this.alertaNotas.evaluar(est.rut_estudiante, {
          incluirRut: true,
          soloRamosDelEstudiante: false,
        })),
      );

      const alertaAcuerdo = this.alertaAcuerdo.evaluar(
        acuerdoVigente,
        rutsFirmantes.has(est.rut_estudiante),
      );
      if (alertaAcuerdo) {
        alertas.push({ rut_estudiante: est.rut_estudiante, ...alertaAcuerdo });
      }
    }

    return alertas;
  }

  async getAlertasByEstudiante(rut_estudiante: string): Promise<Alerta[]> {
    const alertas: Alerta[] = [];

    const entrevistas =
      await this.alertasRepository.getAllEntrevistasbyEstudiante(rut_estudiante);
    if (entrevistas) {
      const alertaEntrevista = this.alertaEntrevista.evaluar(entrevistas);
      if (alertaEntrevista) {
        alertas.push(alertaEntrevista);
      }
    }

    alertas.push(
      ...(await this.alertaNotas.evaluar(rut_estudiante, {
        incluirRut: false,
        soloRamosDelEstudiante: true,
      })),
    );

    const acuerdoVigente = await this.alertasRepository.getAcuerdoVigente();
    if (acuerdoVigente) {
      const firma = await this.alertasRepository.getFirmaAcuerdo(
        acuerdoVigente.id,
        rut_estudiante,
      );
      const alertaAcuerdo = this.alertaAcuerdo.evaluar(acuerdoVigente, firma != null);
      if (alertaAcuerdo) {
        alertas.push(alertaAcuerdo);
      }
    }

    return alertas;
  }

  getAllAlertasByEstudiante(rut_estudiante: string): Promise<Alerta[]> {
    return this.getAlertasByEstudiante(rut_estudiante);
  }

  async getAlertasByGeneracion(generacion: string): Promise<Alerta[]> {
    const estudiantes = (await this.alertasRepository.findAllEstudiantes()) ?? [];
    const filtrados = estudiantes.filter(e => e.generacion === generacion);

    const { acuerdoVigente, rutsFirmantes } = await this.cargarContextoAcuerdo();

    const alertas: Alerta[] = [];

    for (const est of filtrados) {
      const entrevistas =
        await this.alertasRepository.getAllEntrevistasbyEstudiante(est.rut_estudiante);
      if (entrevistas) {
        const alertaEntrevista = this.alertaEntrevista.evaluar(entrevistas);
        if (alertaEntrevista) {
          alertas.push({ rut_estudiante: est.rut_estudiante, ...alertaEntrevista });
        }
      }

      alertas.push(
        ...(await this.alertaNotas.evaluar(est.rut_estudiante, {
          incluirRut: true,
          soloRamosDelEstudiante: true,
        })),
      );

      const alertaAcuerdo = this.alertaAcuerdo.evaluar(
        acuerdoVigente,
        rutsFirmantes.has(est.rut_estudiante),
      );
      if (alertaAcuerdo) {
        alertas.push({ rut_estudiante: est.rut_estudiante, ...alertaAcuerdo });
      }
    }

    return alertas;
  }

  /**
   * Resuelve el acuerdo vigente (global) y el conjunto de ruts que ya lo
   * firmaron, en a lo más dos consultas. Si no hay acuerdo, el set queda vacío
   * y el evaluador no generará alertas.
   */
  private async cargarContextoAcuerdo(): Promise<{
    acuerdoVigente: { id: number } | null;
    rutsFirmantes: Set<string>;
  }> {
    const acuerdoVigente = await this.alertasRepository.getAcuerdoVigente();
    if (!acuerdoVigente) {
      return { acuerdoVigente: null, rutsFirmantes: new Set<string>() };
    }
    const ruts = await this.alertasRepository.getRutsConFirma(acuerdoVigente.id);
    return { acuerdoVigente, rutsFirmantes: new Set(ruts) };
  }
}
