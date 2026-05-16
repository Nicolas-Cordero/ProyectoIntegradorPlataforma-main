import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUniversidadDto } from "./dto/create-universidad.dto";
import { UpdateUniversidadDto } from "./dto/update-universidad.dto";
import { universidad } from "@prisma/client";


@Injectable()
export class UniversidadRepository{
  constructor(
    private readonly prisma: PrismaService,
  ){}

  async create(cretaeUniversidadDto: CreateUniversidadDto): Promise<universidad>{
    try {
      return this.prisma.universidad.create({
        data: cretaeUniversidadDto
      })
    } catch (error) {
      throw new InternalServerErrorException('No se pudo crear la universidad')
    }
  }

  async update(id_universidad: number, updateUniversidadDto: UpdateUniversidadDto): Promise<universidad>{
    try {
      return this.prisma.universidad.update({
        where: {
          codigo_universidad: id_universidad,
        },
        data: updateUniversidadDto
      })
    } catch (error) {
      throw new InternalServerErrorException('No se pudo actualizar la universidad')
    }
  }

  async remove(id_universidad: number): Promise<universidad>{
    try {
      return this.prisma.universidad.delete({
        where: {
          codigo_universidad: id_universidad,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('No se ha podido eliminar la universidad')
    }
  }



  
  async findAll(): Promise<universidad[]>{
    return this.prisma.universidad.findMany()
  }

  async findOne(id_universidad: number): Promise<universidad| null>{
    return this.prisma.universidad.findUnique({
      where: {
        codigo_universidad: id_universidad,
      },
    })
  }

  async findByComuna(comuna: string): Promise<universidad[]>{
    return this.prisma.universidad.findMany({
      where: {
        comuna: comuna
      }
    })
  }

  async findByEstudiante(rut_estudiante: string): Promise<universidad[]>{
    return this.prisma.universidad.findMany({
      where: {
        carreras: {
          some: {
            rut_estudiante: rut_estudiante
          }
        }
      }
    })
  }

}
