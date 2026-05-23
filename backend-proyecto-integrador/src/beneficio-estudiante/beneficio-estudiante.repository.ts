import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { beneficio_estudiante } from "@prisma/client";
import { InternalServerErrorException } from '@nestjs/common';
import { CreateBeneficioEstudianteDto, UpdateBeneficioEstudianteDto } from "./dto";

@Injectable()
export class BeneficioEstudianteRepository{
  constructor(
    private readonly prisma: PrismaService,
  ) {}


  async asociateBeneficioEstudiante(createBeneficioEstudianteDto: CreateBeneficioEstudianteDto): Promise<beneficio_estudiante>{
    try {
      return this.prisma.beneficio_estudiante.create({
        data: createBeneficioEstudianteDto
      })
    } catch (error) {
      throw new InternalServerErrorException('Error al asociar el beneficio con el estudiante')
    }
  }


  async updateAsociation(codigo_beneficio: number, rut_estudiante: string, updateBeneficioEstudianteDto: UpdateBeneficioEstudianteDto): Promise<beneficio_estudiante>{
    try{
      return this.prisma.beneficio_estudiante.update({
        where: {
          codigo_beneficio_rut_estudiante: {
            codigo_beneficio,
            rut_estudiante,
          },
        },
        data: updateBeneficioEstudianteDto
      });
    } catch (error){
      throw new InternalServerErrorException('Error al asociar el beneficio con el estudiante')
    }
  }

  async findAllAsociationsByEstudiante(rut_estudiante: string){
    return this.prisma.beneficio_estudiante.findMany({
      where: {
        rut_estudiante: rut_estudiante
      },
    });
  }

  async findAllAsociationsByBeneficio(codigo_beneficio: number){
    return this.prisma.beneficio_estudiante.findMany({
      where: {
        codigo_beneficio: codigo_beneficio,
      },
    });
  }

  async findOneAsociation(codigo_beneficio: number, rut_estudiante: string): Promise<beneficio_estudiante|null>{
    return this.prisma.beneficio_estudiante.findUnique({
      where: {
        codigo_beneficio_rut_estudiante: {
          codigo_beneficio,
          rut_estudiante,
        },
      },
    });
  }

  async deletAsociation(codigo_beneficio: number, rut_estudiante: string): Promise<beneficio_estudiante>{
    try {
      return this.prisma.beneficio_estudiante.delete({
        where:{
          codigo_beneficio_rut_estudiante:{
            codigo_beneficio,
            rut_estudiante,
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('No se pudo eliminar la asociación')
    }
  }

  async findAllAsociations(): Promise<beneficio_estudiante[]>{
    return this.prisma.beneficio_estudiante.findMany()
  }






}