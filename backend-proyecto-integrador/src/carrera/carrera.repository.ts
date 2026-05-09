import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCarreraDto, UpdateCarreraDto } from "./dto";
import { carrera, ViaAcceso } from "@prisma/client";


@Injectable()
export class Carrera{
  constructor(
    private readonly prisma: PrismaService,
  ){}

  async create(createCarreraDto: CreateCarreraDto): Promise<carrera>{
    try {
      return this.prisma.carrera.create({
        data: createCarreraDto
      })
    } catch (error) {
      throw new InternalServerErrorException(`No se ha podido crear la carrera: ${createCarreraDto.nombre}`)
    }
  }


  async update(id_carrera: number, updateCarreraDto: UpdateCarreraDto): Promise<carrera>{
    try {
      return this.prisma.carrera.update({
        data: updateCarreraDto,
        where: {
          codigo_carrera: id_carrera,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(`No se ha podido actualizar a la carrera: ${id_carrera}`)
    }
  }


  async remove(id_carrera: number): Promise<carrera>{
    try {
      return this.prisma.carrera.delete({
        where: {
          codigo_carrera: id_carrera,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(`no se ha podido eliminar la carrera: ${id_carrera}`)
    }
  }
  
  async findOne(id_carrera: number): Promise<carrera | null>{
    return this.prisma.carrera.findUnique({
      where: {
        codigo_carrera: id_carrera,
      },
    });
  }

  async findAllByEstudiante(rut_estudiante: string): Promise<carrera[]>{
    return this.prisma.carrera.findMany({
      where:{
        rut_estudiante: rut_estudiante,
      },
    });
  }

  async findAllByAcceso(via_acceso: ViaAcceso):Promise<carrera[]>{
    return this.prisma.carrera.findMany({
      where:{
        via_acceso: via_acceso,
      },
    });
  }

  async findAllByUniversidad(id_universidad: number): Promise<carrera[]>{
    return this.prisma.carrera.findMany({
      where: {
        codigo_universidad: id_universidad,
      },
    });
  }
}