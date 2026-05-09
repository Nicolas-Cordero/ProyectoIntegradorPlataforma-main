import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRamoDto, UpdateRamoDto } from "./dto";
import { ramo } from "@prisma/client";


@Injectable()
export class RamoRepository{
  constructor(
    private readonly prisma: PrismaService,
  ){}

  async create(createRamoDto: CreateRamoDto){
    try {
      return this.prisma.ramo.create({
        data: createRamoDto,
      });
    } catch (error) {
      throw new InternalServerErrorException(`No se pudo crear el ramo`)
    }
  }

  async update(id_ramo: number, updateRamoDto: UpdateRamoDto){
    try {
      return this.prisma.ramo.update({
        where: {
          id: id_ramo,
        },
        data: updateRamoDto
      });
    } catch (error) {
      throw new InternalServerErrorException(`No se pudo actualizar el ramo: ${id_ramo}`)
    }
  }

  async remove(id_ramo: number){
    try {
      return this.prisma.ramo.delete({
        where: {
          id: id_ramo,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(`No se ha podido eliminar el ramo`)
    }
  }

  async findAllByEstudiante(rut_estudiante: string): Promise<ramo[]>{
    return this.prisma.ramo.findMany({
      where: {
        rut_estudiante: rut_estudiante,
      },
    });
  }

}