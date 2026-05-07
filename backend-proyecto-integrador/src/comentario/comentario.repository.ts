import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateComentarioDto, UpdateComentarioDto } from "./dto";
import { comentario, Topico } from "@prisma/client";


//revisar si se tendra mas de un comentario por topico.
@Injectable()
export class ComentarioRepository{
  constructor(
    private readonly prisma: PrismaService,
  ){}

  async create(createComentarioDto: CreateComentarioDto): Promise<comentario>{
    try {
      return this.prisma.comentario.create({
        data: createComentarioDto
      })
    } catch (error) {
      throw new InternalServerErrorException(`No se pudo crear el comentario de topico: ${createComentarioDto.topico}`)      
    }
  }

  async update(id_comentario: number, updateComentarioDto: UpdateComentarioDto): Promise<comentario> {
    try {
      return this.prisma.comentario.update({
        where: {
          id: id_comentario,
        },
        data: updateComentarioDto
      });
    } catch (error) {
      throw new InternalServerErrorException(`No se pudo actualizar el comentario de topico: ${id_comentario}`)  
    }
  }

  async delete(id_comentario: number): Promise<comentario>{
    try {
      return this.prisma.comentario.delete({
        where: {
          id: id_comentario,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(`No se pudo eliminar el comentario de topico: ${id_comentario}`)  
    }
  }

  async findAllByEntrevista(id_entrevista: number): Promise<comentario[]>{
    return this.prisma.comentario.findMany({
      where:{
        entrevista_id: id_entrevista,
      },
    });
  }

  async findAllByEstudiante(rut_estudiante){
    return this.prisma.comentario.findMany({
      where:{
        entrevista: {
          rut_estudiante: rut_estudiante,
        }
      }
    })

  }
}