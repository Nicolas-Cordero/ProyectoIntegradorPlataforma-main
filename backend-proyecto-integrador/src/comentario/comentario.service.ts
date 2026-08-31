import { Injectable } from '@nestjs/common';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { comentario } from '@prisma/client';
import { ComentarioRepository } from './comentario.repository';

@Injectable()
export class ComentarioService {
  constructor(private readonly comentarioRepo: ComentarioRepository) {}

  create(createComentarioDto: CreateComentarioDto): Promise<comentario> {
    return this.comentarioRepo.create(createComentarioDto);
  }

  findAllByEntrevista(id_entrevista: number): Promise<comentario[]> {
    return this.comentarioRepo.findAllByEntrevista(id_entrevista);
  }

  findAllByEstudiante(rut_estudiante: string): Promise<comentario[]> {
    return this.comentarioRepo.findAllByEstudiante(rut_estudiante);
  }

  async findOne(id_comentario: number): Promise<comentario> {
    const comentario = await this.comentarioRepo.findOne(id_comentario);

    if (!comentario) {
      throw new Error('No se pudo encontrar el comentario');
    }

    return comentario;
  }

  update(id_comentario: number, updateComentarioDto: UpdateComentarioDto) {
    return this.comentarioRepo.update(id_comentario, updateComentarioDto);
  }

  remove(id_comentario: number) {
    return this.comentarioRepo.delete(id_comentario);
    //revisar que implica eliminar un comentario, pq quizas hay que eliminar algo mas, aunque parece que no
  }
}
