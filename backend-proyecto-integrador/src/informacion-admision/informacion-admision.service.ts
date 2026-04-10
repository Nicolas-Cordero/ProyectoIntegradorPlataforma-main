import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InformacionAdmision } from './entities/informacion-admision.entity';
import { EnsayoPaes } from './entities/ensayo-paes.entity';
import {
  CreateInformacionAdmisionDto,
  UpdateInformacionAdmisionDto,
  CreateEnsayoPaesDto,
  UpdateEnsayoPaesDto,
} from './dto';

@Injectable()
export class InformacionAdmisionService {
  constructor(
    @InjectRepository(InformacionAdmision)
    private readonly admisionRepository: Repository<InformacionAdmision>,
    @InjectRepository(EnsayoPaes)
    private readonly ensayoRepository: Repository<EnsayoPaes>,
  ) {}

  // === INFORMACIÓN DE ADMISIÓN ===

  async create(createDto: CreateInformacionAdmisionDto): Promise<InformacionAdmision> {
    const existe = await this.admisionRepository.findOne({
      where: { estudiante_id: createDto.estudiante_id },
    });

    if (existe) {
      throw new ConflictException('Ya existe información de admisión para este estudiante');
    }

    const admision = this.admisionRepository.create(createDto);
    return await this.admisionRepository.save(admision);
  }

  async findAll(): Promise<InformacionAdmision[]> {
    return await this.admisionRepository.find({
      relations: ['estudiante', 'ensayos_paes'],
    });
  }

  async findOne(id: string): Promise<InformacionAdmision> {
    const admision = await this.admisionRepository.findOne({
      where: { id_informacion_admision: id },
      relations: ['estudiante', 'ensayos_paes'],
    });

    if (!admision) {
      throw new NotFoundException(`Información de admisión con ID ${id} no encontrada`);
    }

    return admision;
  }

  async findByEstudiante(estudianteId: string): Promise<InformacionAdmision> {
    const admision = await this.admisionRepository.findOne({
      where: { estudiante_id: estudianteId },
      relations: ['estudiante', 'ensayos_paes'],
    });

    if (!admision) {
      throw new NotFoundException(`No se encontró información de admisión para el estudiante`);
    }

    return admision;
  }

  async update(id: string, updateDto: UpdateInformacionAdmisionDto): Promise<InformacionAdmision> {
    const admision = await this.findOne(id);
    Object.assign(admision, updateDto);
    return await this.admisionRepository.save(admision);
  }

  async remove(id: string): Promise<void> {
    const admision = await this.findOne(id);
    await this.admisionRepository.remove(admision);
  }

  // === ENSAYOS PAES ===

  async createEnsayo(createDto: CreateEnsayoPaesDto): Promise<EnsayoPaes> {
    const ensayo = this.ensayoRepository.create(createDto);
    return await this.ensayoRepository.save(ensayo);
  }

  async findAllEnsayos(): Promise<EnsayoPaes[]> {
    return await this.ensayoRepository.find({
      relations: ['estudiante', 'admision'],
    });
  }

  async findEnsayo(id: string): Promise<EnsayoPaes> {
    const ensayo = await this.ensayoRepository.findOne({
      where: { id_ensayo_paes: id },
      relations: ['estudiante', 'admision'],
    });

    if (!ensayo) {
      throw new NotFoundException(`Ensayo PAES con ID ${id} no encontrado`);
    }

    return ensayo;
  }

  async findEnsayosByEstudiante(estudianteId: string): Promise<EnsayoPaes[]> {
    return await this.ensayoRepository.find({
      where: { estudiante_id: estudianteId },
      relations: ['estudiante', 'admision'],
      order: { año: 'DESC', mes: 'DESC' },
    });
  }

  async updateEnsayo(id: string, updateDto: UpdateEnsayoPaesDto): Promise<EnsayoPaes> {
    const ensayo = await this.findEnsayo(id);
    Object.assign(ensayo, updateDto);
    return await this.ensayoRepository.save(ensayo);
  }

  async removeEnsayo(id: string): Promise<void> {
    const ensayo = await this.findEnsayo(id);
    await this.ensayoRepository.remove(ensayo);
  }
}
