import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generacion } from '@prisma/client';
import { CreateGeneracionDto } from './dto/create-generacion.dto';
import { UpdateGeneracionDto } from './dto/update-generacion.dto';

@Injectable()
export class GeneracionesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<generacion[]> {
    return this.prisma.generacion.findMany({
      orderBy: { año: 'desc' },
    });
  }

  async findById(id: number): Promise<generacion | null> {
    return this.prisma.generacion.findUnique({
      where: { id },
    });
  }

  async findByAño(año: number): Promise<generacion | null> {
    return this.prisma.generacion.findUnique({
      where: { año },
    });
  }

  async create(data: CreateGeneracionDto): Promise<generacion> {
    return this.prisma.generacion.create({ data });
  }

  async update(id: number, data: UpdateGeneracionDto): Promise<generacion> {
    return this.prisma.generacion.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<generacion> {
    return this.prisma.generacion.delete({
      where: { id },
    });
  }
}
