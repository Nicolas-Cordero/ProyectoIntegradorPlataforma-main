import { Injectable } from '@nestjs/common';
import { Prisma, acuerdo } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentoCompromiso } from './interfaces';

@Injectable()
export class AcuerdoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<acuerdo[]> {
    return this.prisma.acuerdo.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(documento: DocumentoCompromiso): Promise<acuerdo> {
    return this.prisma.acuerdo.create({
      data: { documento: documento as unknown as Prisma.InputJsonValue },
    });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.acuerdo.delete({ where: { id } });
  }

  // Versión vigente del acuerdo = la más reciente (o null si no hay ninguna).
  async findVigente(): Promise<acuerdo | null> {
    return this.prisma.acuerdo.findFirst({ orderBy: { createdAt: 'desc' } });
  }

  // Registra la firma de un estudiante sobre una versión del acuerdo. Idempotente:
  // si ya había firmado esa versión, conserva la firma original (no la duplica ni
  // re-fecha) gracias al @@unique([acuerdo_id, rut_estudiante]).
  async firmar(acuerdo_id: number, rut_estudiante: string) {
    return this.prisma.firma_acuerdo.upsert({
      where: { acuerdo_id_rut_estudiante: { acuerdo_id, rut_estudiante } },
      create: { acuerdo_id, rut_estudiante },
      update: {},
    });
  }

  // Firma de un estudiante para una versión concreta (null si no la ha firmado).
  async findFirma(acuerdo_id: number, rut_estudiante: string) {
    return this.prisma.firma_acuerdo.findUnique({
      where: { acuerdo_id_rut_estudiante: { acuerdo_id, rut_estudiante } },
    });
  }
}
