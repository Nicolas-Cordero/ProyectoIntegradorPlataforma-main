import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoFamiliar, TipoFamiliarCodigo } from './entities/tipo-familiar.entity';
import { Familiar } from './entities/familiar.entity';
import {
  CreateTipoFamiliarDto,
  UpdateTipoFamiliarDto,
  CreateFamiliarDto,
  UpdateFamiliarDto,
} from './dto';

@Injectable()
export class FamiliarService {
  constructor(
    @InjectRepository(TipoFamiliar)
    private readonly tipoFamiliarRepository: Repository<TipoFamiliar>,
    @InjectRepository(Familiar)
    private readonly familiarRepository: Repository<Familiar>,
  ) {}

  // === TIPO FAMILIAR ===

  async createTipo(createDto: CreateTipoFamiliarDto): Promise<TipoFamiliar> {
    const existeNombre = await this.tipoFamiliarRepository.findOne({
      where: { nombre: createDto.nombre },
    });

    if (existeNombre) {
      throw new ConflictException('Ya existe un tipo familiar con ese nombre');
    }

    const existeCodigo = await this.tipoFamiliarRepository.findOne({
      where: { codigo: createDto.codigo },
    });

    if (existeCodigo) {
      throw new ConflictException('Ya existe un tipo familiar con ese código');
    }

    const tipo = this.tipoFamiliarRepository.create(createDto);
    return await this.tipoFamiliarRepository.save(tipo);
  }

  async findAllTipos(): Promise<TipoFamiliar[]> {
    return await this.tipoFamiliarRepository.find({
      order: { orden: 'ASC' },
    });
  }

  async findOneTipo(id: string): Promise<TipoFamiliar> {
    const tipo = await this.tipoFamiliarRepository.findOne({ where: { id_tipo_familiar: id } });

    if (!tipo) {
      throw new NotFoundException(`Tipo familiar con ID ${id} no encontrado`);
    }

    return tipo;
  }

  async updateTipo(id: string, updateDto: UpdateTipoFamiliarDto): Promise<TipoFamiliar> {
    const tipo = await this.findOneTipo(id);
    Object.assign(tipo, updateDto);
    return await this.tipoFamiliarRepository.save(tipo);
  }

  async removeTipo(id: string): Promise<void> {
    const tipo = await this.findOneTipo(id);
    await this.tipoFamiliarRepository.remove(tipo);
  }

  async seedTiposFamiliares(): Promise<void> {
    const tipos = [
      { nombre: 'Madre', codigo: TipoFamiliarCodigo.MADRE, orden: 1 },
      { nombre: 'Padre', codigo: TipoFamiliarCodigo.PADRE, orden: 2 },
      { nombre: 'Hermano/a', codigo: TipoFamiliarCodigo.HERMANO, orden: 3 },
      { nombre: 'Abuelo/a', codigo: TipoFamiliarCodigo.ABUELO, orden: 4 },
      { nombre: 'Tío/a', codigo: TipoFamiliarCodigo.TIO, orden: 5 },
      { nombre: 'Otro', codigo: TipoFamiliarCodigo.OTRO, orden: 6 },
    ];

    for (const tipo of tipos) {
      const existe = await this.tipoFamiliarRepository.findOne({
        where: { codigo: tipo.codigo },
      });

      if (!existe) {
        await this.tipoFamiliarRepository.save(this.tipoFamiliarRepository.create(tipo));
      }
    }
  }

  // === FAMILIAR ===

  async create(createDto: CreateFamiliarDto): Promise<Familiar> {
    const familiar = this.familiarRepository.create(createDto);
    return await this.familiarRepository.save(familiar);
  }

  async findAll(): Promise<Familiar[]> {
    return await this.familiarRepository.find({
      relations: ['estudiante', 'tipo_familiar'],
      order: { tipo_familiar: { orden: 'ASC' } },
    });
  }

  async findOne(id: string): Promise<Familiar> {
    const familiar = await this.familiarRepository.findOne({
      where: { id_familiar: id },
      relations: ['estudiante', 'tipo_familiar'],
    });

    if (!familiar) {
      throw new NotFoundException(`Familiar con ID ${id} no encontrado`);
    }

    return familiar;
  }

  async findByEstudiante(estudianteId: string): Promise<Familiar[]> {
    return await this.familiarRepository.find({
      where: { estudiante_id: estudianteId },
      relations: ['estudiante', 'tipo_familiar'],
      order: { tipo_familiar: { orden: 'ASC' } },
    });
  }

  async update(id: string, updateDto: UpdateFamiliarDto): Promise<Familiar> {
    const familiar = await this.findOne(id);
    Object.assign(familiar, updateDto);
    return await this.familiarRepository.save(familiar);
  }

  async remove(id: string): Promise<void> {
    const familiar = await this.findOne(id);
    await this.familiarRepository.remove(familiar);
  }
}
