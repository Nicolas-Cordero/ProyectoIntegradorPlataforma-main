import { Injectable, NotFoundException } from '@nestjs/common';
import { acuerdo } from '@prisma/client';
import { AcuerdoRepository } from './acuerdo.repository';
import { CreateAcuerdoDto } from './dto/create-acuerdo.dto';
import { UpdateAcuerdoDto } from './dto/update-acuerdo.dto';
import { DocumentoCompromiso } from './interfaces';

@Injectable()
export class AcuerdoService {
  constructor(private readonly acuerdoRepo: AcuerdoRepository) {}

  create(createAcuerdoDto: CreateAcuerdoDto): Promise<acuerdo> {
    return this.acuerdoRepo.create(createAcuerdoDto.documento);
  }

  findAll(): Promise<acuerdo[]> {
    return this.acuerdoRepo.findAll();
  }

  /**
   * Retorna el acuerdo cuyo `createdAt` está más cercano a la fecha indicada.
   * Permite, por ejemplo, obtener la versión vigente del compromiso para un día dado.
   */
  async findMostNear(fecha: Date): Promise<acuerdo> {
    const acuerdos = await this.acuerdoRepo.findAll();

    if (!acuerdos || acuerdos.length === 0) {
      throw new NotFoundException('No hay acuerdos registrados');
    }

    const objetivo = fecha.getTime();

    return acuerdos.reduce((masCercano, actual) => {
      const diffActual = Math.abs(
        new Date(actual.createdAt).getTime() - objetivo,
      );
      const diffCercano = Math.abs(
        new Date(masCercano.createdAt).getTime() - objetivo,
      );
      return diffActual < diffCercano ? actual : masCercano;
    });
  }

  /**
   * Aplica los cambios sobre el documento del acuerdo `id` y persiste una
   * versión nueva (nueva fila con su propio `createdAt`), sin mutar la original.
   * Si no se encuentra el acuerdo base, se crea a partir de lo recibido.
   */
  async update(
    id: number,
    updateAcuerdoDto: UpdateAcuerdoDto,
  ): Promise<acuerdo> {
    const acuerdos = await this.acuerdoRepo.findAll();
    const base = acuerdos?.find((a) => a.id === id);
    const documentoBase = base?.documento as unknown as
      | DocumentoCompromiso
      | undefined;

    const documentoActualizado = {
      ...documentoBase,
      ...updateAcuerdoDto.documento,
    } as DocumentoCompromiso;

    return this.acuerdoRepo.create(documentoActualizado);
  }

  remove(id: number): Promise<void> {
    return this.acuerdoRepo.remove(id);
  }

  /**
   * Firma, en nombre del estudiante, la versión vigente del acuerdo. La versión
   * se resuelve en el servidor para impedir que se firme una versión antigua.
   * Es idempotente: volver a firmar la misma versión no genera una firma nueva.
   */
  async firmarVigente(rut_estudiante: string): Promise<EstadoFirmaAcuerdo> {
    const vigente = await this.acuerdoRepo.findVigente();
    if (!vigente) {
      throw new NotFoundException('No hay un acuerdo vigente para firmar');
    }
    const firma = await this.acuerdoRepo.firmar(vigente.id, rut_estudiante);
    return {
      hayAcuerdoVigente: true,
      acuerdoId: vigente.id,
      firmado: true,
      firmadoAt: firma.firmado_at,
    };
  }

  /**
   * Estado de firma del estudiante respecto de la versión vigente del acuerdo.
   * Si no existe ningún acuerdo, `hayAcuerdoVigente` es false y no hay nada que firmar.
   */
  async getEstadoFirmaVigente(
    rut_estudiante: string,
  ): Promise<EstadoFirmaAcuerdo> {
    const vigente = await this.acuerdoRepo.findVigente();
    if (!vigente) {
      return {
        hayAcuerdoVigente: false,
        acuerdoId: null,
        firmado: false,
        firmadoAt: null,
      };
    }
    const firma = await this.acuerdoRepo.findFirma(vigente.id, rut_estudiante);
    return {
      hayAcuerdoVigente: true,
      acuerdoId: vigente.id,
      firmado: firma != null,
      firmadoAt: firma?.firmado_at ?? null,
    };
  }

  /**
   * Estudiantes que firmaron una versión concreta del acuerdo, con la fecha en que
   * firmaron. Lanza NotFoundException si esa versión no existe.
   */
  async getFirmantes(acuerdoId: number): Promise<FirmanteAcuerdo[]> {
    const acuerdo = await this.acuerdoRepo.findById(acuerdoId);
    if (!acuerdo) {
      throw new NotFoundException(`No existe un acuerdo con id ${acuerdoId}`);
    }

    const firmas = await this.acuerdoRepo.findFirmantes(acuerdoId);
    return firmas.map((f) => ({
      rut_estudiante: f.estudiante.rut_estudiante,
      nombre: f.estudiante.nombre,
      apellido: f.estudiante.apellido,
      firmadoAt: f.firmado_at,
    }));
  }
}

export interface EstadoFirmaAcuerdo {
  hayAcuerdoVigente: boolean;
  acuerdoId: number | null;
  firmado: boolean;
  firmadoAt: Date | null;
}

export interface FirmanteAcuerdo {
  rut_estudiante: string;
  nombre: string;
  apellido: string;
  firmadoAt: Date;
}
