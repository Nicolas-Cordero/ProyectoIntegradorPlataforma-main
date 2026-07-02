import { Injectable, BadRequestException } from '@nestjs/common';
import { EntrevistaRepository } from './entrevista.repository';
import type {
  EntrevistaConRelaciones,
  EntrevistaConDetalle,
} from './entrevista.repository';
import { PrismaService } from '../prisma/prisma.service';
import { entrevista, TipoSemestre } from '@prisma/client';
import { UpdateEntrevistaDto, CreateEntrevistaDto } from './dto';
import { Semestre } from '../semestre/semestre.enum';

@Injectable()
export class EntrevistasService {
  constructor(
    private readonly entrevistaRepo: EntrevistaRepository,
    private readonly prisma: PrismaService,
  ) {}

  // Dado un Date, devuelve el semestre_id del semestre regular correspondiente.
  // Si la fila no existe en la tabla semestre, la crea automáticamente.
  async resolveSemestreId(fecha: Date): Promise<number> {
    const year = fecha.getFullYear();
    const month = fecha.getMonth() + 1;
    const semestre =
      month <= 6 ? Semestre.PRIMER_SEMESTRE : Semestre.SEGUNDO_SEMESTRE;

    const result = await this.prisma.semestre.upsert({
      where: { year_semestre: { year, semestre } },
      create: { year, semestre, tipo: TipoSemestre.REGULAR },
      update: {},
    });

    return result.semestre_id;
  }

  async create(
    createEntrevistaDto: CreateEntrevistaDto,
    rut_entrevistador: string,
  ): Promise<entrevista> {
    const fecha_hora = createEntrevistaDto.fecha_hora ?? new Date();
    const semestre_id = await this.resolveSemestreId(fecha_hora);

    return this.entrevistaRepo.create({
      rut_estudiante: createEntrevistaDto.rut_estudiante,
      rut_entrevistador,
      fecha_hora,
      semestre_id,
      duracion_s: createEntrevistaDto.duracion_s,
      resumen: createEntrevistaDto.resumen,
      comentarios: createEntrevistaDto.comentarios ?? [],
    });
  }

  findAll(): Promise<entrevista[]> {
    return this.entrevistaRepo.findAll();
  }

  findAllByEstudiante(
    rut_estudiante: string,
  ): Promise<EntrevistaConRelaciones[]> {
    return this.entrevistaRepo.findByEstudiante(rut_estudiante);
  }

  async findOne(id_entrevista: number): Promise<EntrevistaConDetalle> {
    const entrevista = await this.entrevistaRepo.findById(id_entrevista);

    if (!entrevista) {
      throw new BadRequestException('No se encontro la entrevista');
    }
    return entrevista;
  }

  deleteEntrevista(id_entrevista: number): Promise<entrevista> {
    return this.entrevistaRepo.delete(id_entrevista);
  }

  async updateEntrevista(
    id_entrevista: number,
    updateEntrevistaDto: UpdateEntrevistaDto,
  ): Promise<entrevista> {
    let semestre_id: number | undefined;
    if (updateEntrevistaDto.fecha_hora) {
      semestre_id = await this.resolveSemestreId(
        updateEntrevistaDto.fecha_hora,
      );
    }
    return this.entrevistaRepo.update(id_entrevista, {
      ...updateEntrevistaDto,
      semestre_id,
    });
  }
}
