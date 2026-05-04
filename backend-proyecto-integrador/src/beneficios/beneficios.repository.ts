import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { beneficio } from "@prisma/client";
import { CreateBeneficioDto, UpdateBeneficioDto } from "./dto";


@Injectable()
export class BeneficiosRepository{
  constructor(private readonly prisma: PrismaService,) {}

  //beneficios

  async createBeneficio(createBeneficioDto: CreateBeneficioDto): Promise<beneficio>{
    try {
      return this.prisma.beneficio.create({
        data: createBeneficioDto
      })
    } catch (error) {
      throw new Error(`No se pudo crear el beneficio: ${createBeneficioDto}`)
    }
  }

  async findAllBeneficios(): Promise<beneficio[]>{
    return this.prisma.beneficio.findMany({
      orderBy:{ nombre: 'asc' }
    })
  }

  async findByCode(codigo: number): Promise<beneficio | null>{
    return this.prisma.beneficio.findUnique({
      where: {
        codigo_beneficio: codigo,
      },
    });
  }

  async findByName(nombre: string): Promise<beneficio | null>{
    return this.prisma.beneficio.findUnique({
      where: {
        nombre: nombre,
      },
    });
  }

  async updateBeneficioByID(id: number, updateBeneficioDto: UpdateBeneficioDto): Promise<beneficio>{
    try {
      return this.prisma.beneficio.update({
        where:{
          codigo_beneficio: id,
        },
        data: updateBeneficioDto,
      });
    } catch (error) {
      throw new Error(`No se pudo actualizar el beneficio: ${id}`)
    }
  }


  async deleteBeneficioByID(id: number): Promise<beneficio>{
    try {
      return this.prisma.beneficio.delete({
        where: {
          codigo_beneficio: id,
        },
      });
    } catch (error) {
      throw new Error(`No se pudo eliminar el beneficio: ${id}`)
    }
  }


}