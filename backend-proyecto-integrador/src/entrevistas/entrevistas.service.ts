import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { EntrevistaRepository } from './entrevista.repository';
import { entrevista } from '@prisma/client';
import { UpdateEntrevistaDto, CreateEntrevistaDto  } from './dto';

@Injectable()
export class EntrevistasService {
  constructor(
    private readonly entrevistaRepo: EntrevistaRepository,
  ) {}

  // MÉTODO PARA CREAR ENTREVISTA
  create(createEntrevistaDto: CreateEntrevistaDto): Promise<entrevista> {
    return this.entrevistaRepo.create(createEntrevistaDto);
  }

  findAll(): Promise<entrevista[]> {
    return this.entrevistaRepo.findAll();
  }

  findAllByEstudiante(rut_estudiante: string): Promise<entrevista[]> {
    return this.entrevistaRepo.findByEstudiante(rut_estudiante);
  }

  async findOne(id_entrevista: number): Promise<entrevista> {
    const entrevista = await this.entrevistaRepo.findById(id_entrevista);

    if(!entrevista){
      throw new BadRequestException('No se encontro la entrevista');
    }
    return entrevista;
  }
  
  deleteEntrevista(id_entrevista: number): Promise<entrevista> {
    //al eliminar una entrevista, todos los comentarios no estan siendo elinminados.
    return this.entrevistaRepo.delete(id_entrevista);
  }

  updateEntrevista(id_entrevista: number, updateEntrevistaDto: UpdateEntrevistaDto,): Promise<entrevista> {
    return this.entrevistaRepo.update(id_entrevista, updateEntrevistaDto);
  }

}
