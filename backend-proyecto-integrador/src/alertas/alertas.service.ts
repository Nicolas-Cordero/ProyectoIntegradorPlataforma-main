import { Injectable } from '@nestjs/common';
import { AlertasRepository } from './alertas.repository';
import { AlertaEntrevistaService } from './alerta-entrevista.service';
import { AlertaNotasService, RamoSinNota } from './alerta-notas.service';
import { AlertaAcuerdoService } from './alerta-acuerdo.service';
import { Alerta } from './entities/alerta.entity';

/**
 * Gestor de alertas: orquesta los distintos tipos de alerta (entrevistas,
 * notas y firma del acuerdo). Decide qué estudiantes evaluar y trae sus datos
 * en bloque; las reglas de cada tipo viven en su propio servicio.
 *
 * Para sumar un nuevo tipo basta con inyectar su servicio, traer sus datos en
 * bloque en `evaluar` y llamarlo dentro del recorrido de estudiantes.
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
    const ruts = await this.alertasRepository.findRutsEstudiantes();
    return this.evaluar(ruts, true);
  }

  async getAlertasByGeneracion(generacion: string): Promise<Alerta[]> {
    const año = Number(generacion);
    if (!Number.isInteger(año)) return [];
    const ruts = await this.alertasRepository.findRutsEstudiantes(año);
    return this.evaluar(ruts, true);
  }

  getAlertasByEstudiante(rut_estudiante: string): Promise<Alerta[]> {
    return this.evaluar([rut_estudiante], false);
  }

  getAllAlertasByEstudiante(rut_estudiante: string): Promise<Alerta[]> {
    return this.getAlertasByEstudiante(rut_estudiante);
  }

  /**
   * Evalúa todas las alertas de los estudiantes indicados con una cantidad fija
   * de consultas (no una por estudiante). Las alertas salen agrupadas por
   * estudiante, en el orden de `ruts`: entrevista, notas y acuerdo.
   *
   * @param incluirRut agrega rut_estudiante a cada alerta (vistas de varios
   *                   estudiantes; en la vista de uno solo sobra).
   */
  private async evaluar(
    ruts: string[],
    incluirRut: boolean,
  ): Promise<Alerta[]> {
    if (ruts.length === 0) return [];

    const [ultimasEntrevistas, ramosSinNota, acuerdoVigente] =
      await Promise.all([
        this.alertasRepository.getUltimaEntrevistaPorEstudiante(ruts),
        this.alertasRepository.getRamosSinNota(ruts),
        this.alertasRepository.getAcuerdoVigente(),
      ]);
    // Sin acuerdo vigente no hay nada que firmar ni firmas que consultar.
    const rutsFirmantes = new Set(
      acuerdoVigente
        ? await this.alertasRepository.getRutsConFirma(acuerdoVigente.id, ruts)
        : [],
    );

    const ramosPorRut = new Map<string, RamoSinNota[]>();
    for (const ramo of ramosSinNota) {
      const lista = ramosPorRut.get(ramo.rut_estudiante) ?? [];
      lista.push(ramo);
      ramosPorRut.set(ramo.rut_estudiante, lista);
    }

    return ruts.flatMap((rut) => {
      const alertas = [
        this.alertaEntrevista.evaluar(ultimasEntrevistas.get(rut)),
        ...this.alertaNotas.evaluar(ramosPorRut.get(rut) ?? []),
        this.alertaAcuerdo.evaluar(acuerdoVigente, rutsFirmantes.has(rut)),
      ].filter((a): a is Alerta => a !== null);
      return incluirRut
        ? alertas.map((a) => ({ rut_estudiante: rut, ...a }))
        : alertas;
    });
  }
}
