import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { estudiante } from "@prisma/client";
import { CreateEstudianteDto } from "./dto/create-estudiante.dto";
import { UpdateEstudianteDto } from "./dto/update-estudiante.dto";


@Injectable()
export class EstudianteRepository{
  constructor(private readonly prisma: PrismaService,) {}

  async findEstudianteByRut(rut_estudiante: string): Promise<estudiante | null>{
    return this.prisma.estudiante.findUnique({
      where: {
        rut_estudiante: rut_estudiante,
      },
    });
  }

  async findEstudianteByRutComplete(rut_estudiante: string): Promise<estudiante | null>{
    return this.prisma.estudiante.findUnique({
      where: {
        rut_estudiante: rut_estudiante,
      },
      include: {
        carreras: {
          include: {
            universidad: true,
          },
        },
        estado_academico: true,
        familiares: true,
        beneficios: true,
        ramos: true,
        contactos_emergencia: true,
      },
    });
  }


  async findEstudianteByGeneracion(generacion: string): Promise<estudiante[]>{
    return this.prisma.estudiante.findMany({
      where: {
        generacion: generacion,
      },
    });
  }


  async findAllEstudiantes(): Promise<estudiante[]>{
    return this.prisma.estudiante.findMany();
  }


  async findByliceo(rbd_liceo: string): Promise<estudiante[]>{
    return this.prisma.estudiante.findMany({
      where:{
        rbd_liceo: rbd_liceo,
      },
    });
  }


  async findByUniversidad(codigo_universidad: number): Promise<estudiante[]> {
    return this.prisma.estudiante.findMany({
      where: {
        carreras: {
          some:{
            universidad: {
              codigo_universidad: codigo_universidad
            }
          }
        }
      }
    })
  }


  async create(createEstudianteDto: CreateEstudianteDto){
    try {
      return this.prisma.estudiante.create({
        data: createEstudianteDto,
      });
    } catch (error) {
      throw new InternalServerErrorException(`No se pudo crear el estudiante con rut: ${createEstudianteDto.rut_estudiante}`)
    }
  }


  async update(rut_estudiante: string, updateEstudianteDto: UpdateEstudianteDto){
    try {
      return this.prisma.estudiante.update({
        where:{
          rut_estudiante: rut_estudiante,
        },
        data: updateEstudianteDto,
      });
    } catch (error) {
      throw new InternalServerErrorException(`No se pudo actualizar el estudiante con rut: ${rut_estudiante}`)
    }
  }

  
  async remove(rut_estudiante: string){
    try {
      return this.prisma.estudiante.delete({
        where: {
          rut_estudiante: rut_estudiante,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(`No se ha podido eliminar el estudiante: ${rut_estudiante}`)
    }
  }

}