import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paes } from '@prisma/client';
import { CreatePaesDto } from './dto/create-paes.dto';
import { UpdatePaesDto } from './dto/update-paes.dto';

@Injectable()
export class PaesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPaesByEstudiante(rut_estudiante: string): Promise<paes | null> {
    return this.prisma.paes.findUnique({
      where: { rut_estudiante },
    });
  }

  async findAll(): Promise<paes[]> {
    return this.prisma.paes.findMany();
  }

  async findAllEstudiantes(): Promise<
    { rut_estudiante: string; generacion: string }[]
  > {
    const estudiantes = await this.prisma.estudiante.findMany({
      select: {
        rut_estudiante: true,
        generacion_rel: {
          select: { año: true },
        },
      },
    });
    return estudiantes.map((e) => ({
      rut_estudiante: e.rut_estudiante,
      generacion: String(e.generacion_rel.año),
    }));
  }

  async create(createPaesDto: CreatePaesDto): Promise<paes> {
    return this.prisma.paes.create({
      data: createPaesDto,
    });
  }

  async update(
    rut_estudiante: string,
    updatePaesDto: UpdatePaesDto,
  ): Promise<paes> {
    return this.prisma.paes.update({
      where: { rut_estudiante },
      data: updatePaesDto,
    });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.paes.delete({
      where: { id },
    });
  }
}
