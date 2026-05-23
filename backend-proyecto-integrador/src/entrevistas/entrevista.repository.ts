import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEntrevistaDto, UpdateEntrevistaDto } from "./dto";
import { entrevista } from "@prisma/client";

@Injectable()
export class EntrevistaRepository {
  constructor(
    private readonly prisma: PrismaService,
  ){}

  async create(createEntrevistaDto: CreateEntrevistaDto): Promise<entrevista>{
    try {
      return this.prisma.entrevista.create({
        data: createEntrevistaDto
      })
    } catch (error) {
      throw new InternalServerErrorException("No se pudo crear la entrevista");
    }
  }

  async update(id_entrevista: number, updateEntrevistaDto: UpdateEntrevistaDto): Promise<entrevista>{
    try {
      return this.prisma.entrevista.update({
        where: {
          id: id_entrevista,
        },
        data: updateEntrevistaDto,
      });
    } catch (error) {
      throw new InternalServerErrorException(`No se pudo actualizar la entrevista ${id_entrevista}`);
    }
  }


  async delete(id_entrevista: number): Promise<entrevista>{
    try {
      return this.prisma.entrevista.delete({
        where: {
          id: id_entrevista,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(`No se pudo eliminar la entrevista: ${id_entrevista}`)
    }
  }

  async findById(id_entrevista: number): Promise<entrevista | null>{
    return this.prisma.entrevista.findUnique({
      where: {
        id: id_entrevista,
      },
    });
  }


  async findByEstudiante(rut_estudiante: string): Promise<entrevista[]>{
    return this.prisma.entrevista.findMany({
      where: {
        rut_estudiante: rut_estudiante,
      },
    });
  }

  async findByEntrevistador(rut_entrevistador: string): Promise<entrevista[]>{
    return this.prisma.entrevista.findMany({
      where: {
        rut_entrevistador: rut_entrevistador,
      },
    });
  }

  //yo creo que no se usara
  async findAll(): Promise<entrevista[]>{
    return this.prisma.entrevista.findMany();
  }
}