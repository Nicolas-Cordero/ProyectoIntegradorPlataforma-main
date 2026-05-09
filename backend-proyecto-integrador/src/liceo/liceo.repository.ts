import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLiceoDto, UpdateLiceoDto } from "./dto";
import { liceo } from "@prisma/client";

@Injectable()
export class Liceo{
  constructor(
    private readonly prisma: PrismaService,
  ){}

  async create(createLiceoDto: CreateLiceoDto): Promise<liceo>{
    try {
      return this.prisma.liceo.create({
        data: createLiceoDto
      })
    } catch (error) {
      throw new InternalServerErrorException(`No se ha podido crear el liceo: ${createLiceoDto.rbd}`)
    }
  }

  async update(rbd: string, udpateLiceoDto: UpdateLiceoDto): Promise<liceo>{
    try {
      return this.prisma.liceo.update({
        where: {
          rbd: rbd,
        },
        data: udpateLiceoDto,
      });

    } catch (error) {
      throw new InternalServerErrorException(`No se ha podido actualizar el liceo: ${rbd}`)
    }
  }

  async remove(rbd: string): Promise<liceo>{
    try {
      return this.prisma.liceo.delete({
        where: {
          rbd: rbd,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(`No se ha podido eliminar el liceo: ${rbd}`)
    }
  }

  async findAll(): Promise<liceo[]>{
    return this.prisma.liceo.findMany()
  }

  async findByComuna(comuna: string): Promise<liceo[]>{
    return this.prisma.liceo.findMany({
      where: {
        comuna: comuna,
      },
    });
  }


  //sera necesario usar un enum para especialidad?
    async findByEspecialidad(especialidad: string): Promise<liceo[]>{
    return this.prisma.liceo.findMany({
      where: {
        especialidad: especialidad,
      },
    });
  }



}