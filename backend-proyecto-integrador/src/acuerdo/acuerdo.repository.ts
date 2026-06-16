import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
    try {
      return await this.prisma.acuerdo.create({
        data: { documento: documento as unknown as Prisma.InputJsonValue },
      });
    } catch (error) {
      throw new InternalServerErrorException('No se pudo crear el acuerdo');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.prisma.acuerdo.delete({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException(`No se pudo eliminar el acuerdo con id ${id}`);
    }
  }
}
