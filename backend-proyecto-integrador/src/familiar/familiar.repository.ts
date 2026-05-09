import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { familiar } from "@prisma/client";
import { CreateFamiliarDto, UpdateFamiliarDto } from "./dto";


@Injectable()
export class FamiliarRepository{
  constructor(
    private readonly prisma: PrismaService,
  ){}

  async create(createFamiliarDto: CreateFamiliarDto){
    try {
      return this.prisma.familiar.create({
        data: createFamiliarDto
      })
    } catch (error) {
      throw new InternalServerErrorException(`No se pudo crear el familiar`)
    }
  }
  
  async update(id_familiar: number, updateFamiliarDto: UpdateFamiliarDto){
    try {
      return this.prisma.familiar.update({
        data: updateFamiliarDto,
        where: {
          id: id_familiar
        }
      })
    } catch (error) {
      throw new InternalServerErrorException(`No se pudo actualizar el familiar: ${id_familiar}`)
    }
  }

  async remove(id_familiar: number){
    try {
      return this.prisma.familiar.delete({
        where: {
          id: id_familiar,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(`no se pudo eliminar el familiar: ${id_familiar}`)
    }
  }

  async findFamiliar(id_familiar: number): Promise<familiar | null>{
    return this.prisma.familiar.findUnique({
      where: {
        id: id_familiar,
      },
    });
  }

  async findByEstudiante(rut_estudiante: string): Promise<familiar[]>{
    return this.prisma.familiar.findMany({
      where: {
        rut_estudiante: rut_estudiante,
      },
    });
  }

}