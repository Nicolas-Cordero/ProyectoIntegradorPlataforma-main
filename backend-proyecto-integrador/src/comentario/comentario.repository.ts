import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComentarioDto, UpdateComentarioDto } from './dto';
import { comentario } from '@prisma/client';

@Injectable()
export class ComentarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createComentarioDto: CreateComentarioDto): Promise<comentario> {
    return this.prisma.comentario.create({
      data: createComentarioDto,
    });
  }

  async update(
    id_comentario: number,
    updateComentarioDto: UpdateComentarioDto,
  ): Promise<comentario> {
    return this.prisma.comentario.update({
      where: {
        id: id_comentario,
      },
      data: updateComentarioDto,
    });
  }

  async delete(id_comentario: number): Promise<comentario> {
    return this.prisma.comentario.delete({
      where: {
        id: id_comentario,
      },
    });
  }

  async findAllByEntrevista(id_entrevista: number): Promise<comentario[]> {
    return this.prisma.comentario.findMany({
      where: {
        entrevista_id: id_entrevista,
      },
    });
  }

  async findAllByEstudiante(rut_estudiante: string): Promise<comentario[]> {
    return this.prisma.comentario.findMany({
      where: {
        entrevista: {
          rut_estudiante: rut_estudiante,
        },
      },
    });
  }

  async findOne(id_comentario: number): Promise<comentario | null> {
    return this.prisma.comentario.findUnique({
      where: {
        id: id_comentario,
      },
    });
  }
}
