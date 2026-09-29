import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateUniversidadDto } from './dto/create-universidad.dto';
import { UpdateUniversidadDto } from './dto/update-universidad.dto';
import {
  UniversidadConComuna,
  UniversidadRepository,
} from './universidad.repository';

// Forma comparable de un nombre de institución: sin mayúsculas, tildes,
// signos ni espacios repetidos. "Inacap", "INACAP" e "I.N.A.C.A.P." dan lo
// mismo. El índice único de la base compara el texto exacto, así que sin esto
// dos variantes del mismo nombre pasarían como instituciones distintas.
export function normalizarNombreInstitucion(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

// Espacios sobrantes fuera, para que lo guardado se vea igual en todas partes.
function limpiarNombre(nombre: string): string {
  return nombre.trim().replace(/\s+/g, ' ');
}

@Injectable()
export class UniversidadService {
  constructor(private readonly universidadRepo: UniversidadRepository) {}

  async create(
    createUniversidadDto: CreateUniversidadDto,
  ): Promise<UniversidadConComuna> {
    const nombre = limpiarNombre(createUniversidadDto.nombre);
    await this.validarNoDuplicada(nombre, createUniversidadDto.codigo_comuna);
    return this.universidadRepo.create({ ...createUniversidadDto, nombre });
  }

  findAll(): Promise<UniversidadConComuna[]> {
    return this.universidadRepo.findAll();
  }

  async findOne(id_universidad: number): Promise<UniversidadConComuna> {
    const universidad = await this.universidadRepo.findOne(id_universidad);
    if (!universidad) {
      throw new Error(`Universidad con id ${id_universidad} no encontrada`);
    }
    return universidad;
  }

  findByComuna(codigo_comuna: number): Promise<UniversidadConComuna[]> {
    return this.universidadRepo.findByComuna(codigo_comuna);
  }

  findByEstudiante(rut_estudiante: string): Promise<UniversidadConComuna[]> {
    return this.universidadRepo.findByEstudiante(rut_estudiante);
  }

  async update(
    id_universidad: number,
    updateUniversidadDto: UpdateUniversidadDto,
  ): Promise<UniversidadConComuna> {
    if (
      updateUniversidadDto.nombre === undefined &&
      updateUniversidadDto.codigo_comuna === undefined
    ) {
      return this.universidadRepo.update(id_universidad, updateUniversidadDto);
    }

    // Se valida el par (nombre, comuna) con el que QUEDA la institución.
    const actual = await this.findOne(id_universidad);
    const nombre = limpiarNombre(updateUniversidadDto.nombre ?? actual.nombre);
    const codigo_comuna =
      updateUniversidadDto.codigo_comuna ?? actual.codigo_comuna;
    await this.validarNoDuplicada(nombre, codigo_comuna, id_universidad);
    return this.universidadRepo.update(id_universidad, {
      ...updateUniversidadDto,
      nombre,
    });
  }

  // Una universidad es referenciada por carreras de potencialmente muchos
  // estudiantes distintos; no se puede eliminar bajo ninguna circunstancia.
  remove(): never {
    throw new ForbiddenException('Las universidades no se pueden eliminar.');
  }

  // Una misma institución puede repetirse en comunas distintas (cada sede es
  // una fila del catálogo), pero no dos veces en la misma comuna.
  private async validarNoDuplicada(
    nombre: string,
    codigo_comuna: number,
    excluirId?: number,
  ): Promise<void> {
    const buscado = normalizarNombreInstitucion(nombre);
    const enLaComuna = await this.universidadRepo.findByComuna(codigo_comuna);
    const existente = enLaComuna.find(
      (u) =>
        u.codigo_universidad !== excluirId &&
        normalizarNombreInstitucion(u.nombre) === buscado,
    );
    if (existente) {
      throw new ConflictException(
        `La institución ya existe: "${existente.nombre}" (${existente.comuna.nombre}).`,
      );
    }
  }
}
