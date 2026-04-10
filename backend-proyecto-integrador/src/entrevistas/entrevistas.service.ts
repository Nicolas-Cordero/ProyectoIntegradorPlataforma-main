import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entrevista } from './entities/entrevista.entity';
import { Etiqueta } from './entities/etiqueta.entity';
import { Texto } from './entities/texto.entity';
import { CreateEntrevistaDto } from './dto/create-entrevista.dto';

@Injectable()
export class EntrevistasService {
  constructor(
    @InjectRepository(Entrevista)
    private entrevistaRepository: Repository<Entrevista>,
    @InjectRepository(Etiqueta)
    private etiquetaRepository: Repository<Etiqueta>,
    @InjectRepository(Texto)
    private textoRepository: Repository<Texto>,
  ) {}

  // MÉTODO PARA CREAR ENTREVISTA
  async create(createEntrevistaDto: CreateEntrevistaDto, userId: string): Promise<Entrevista> {
    // 1. Verificar que no existe ya esta entrevista para este estudiante
    const existe = await this.entrevistaRepository.findOne({
      where: {
        estudianteId: createEntrevistaDto.id_estudiante.toString(),
        año: createEntrevistaDto.año,
        numero_Entrevista: createEntrevistaDto.numero_entrevista,
      },
    });

    if (existe) {
      throw new BadRequestException(
        `Ya existe la entrevista ${createEntrevistaDto.numero_entrevista} para el año ${createEntrevistaDto.año}`,
      );
    }

    // 2. Respetar fecha y hora provistas (ya vienen en ISO desde el frontend)
    const fechaEntrevista = new Date(createEntrevistaDto.fecha);
    if (Number.isNaN(fechaEntrevista.getTime())) {
      throw new BadRequestException('Fecha de entrevista inválida');
    }

    // 3. Crear la nueva entrevista
    const nuevaEntrevista = this.entrevistaRepository.create({
      estudianteId: createEntrevistaDto.id_estudiante.toString(),
      usuarioId: userId,
      fecha: fechaEntrevista,
      nombre_Tutor: createEntrevistaDto.nombre_tutor,
      año: createEntrevistaDto.año,
      numero_Entrevista: createEntrevistaDto.numero_entrevista,
      duracion_minutos: createEntrevistaDto.duracion_minutos,
      estado: createEntrevistaDto.estado as any,
      observaciones: createEntrevistaDto.observaciones ?? '',
      informacion_adicional: createEntrevistaDto.informacion_adicional ?? '',
      temas_abordados: createEntrevistaDto.temas_abordados,
    });

    const entrevistaSaved = await this.entrevistaRepository.save(nuevaEntrevista);

    // 3. Procesar y guardar textos con sus etiquetas
    if (createEntrevistaDto.etiquetas && createEntrevistaDto.etiquetas.length > 0) {
      await this.procesarTextos(
        entrevistaSaved.id,
        createEntrevistaDto.etiquetas,
      );
    }

    // 4. Retornar la entrevista con sus relaciones
    const entrevistaCompleta = await this.entrevistaRepository.findOne({
      where: { id: entrevistaSaved.id },
      relations: ['estudiante', 'usuario', 'textos', 'textos.etiqueta'],
    });

    return entrevistaCompleta!;
  }

  // MÉTODO AUXILIAR: Procesar textos y etiquetas
  private async procesarTextos(
    entrevistaId: string,
    etiquetasDto: any[],
  ): Promise<void> {
    for (const etiquetaDto of etiquetasDto) {
      // Asegurar que la etiqueta existe en la tabla etiquetas
      let etiqueta = await this.etiquetaRepository.findOne({
        where: { nombre_etiqueta: etiquetaDto.nombre_etiqueta },
      });

      if (!etiqueta) {
        // Crear la etiqueta si no existe
        etiqueta = this.etiquetaRepository.create({
          nombre_etiqueta: etiquetaDto.nombre_etiqueta,
        });
        await this.etiquetaRepository.save(etiqueta);
      }

      // Crear los textos asociados
      if (etiquetaDto.textos && etiquetaDto.textos.length > 0) {
        for (const textoDto of etiquetaDto.textos) {
          const texto = this.textoRepository.create({
            entrevistaId: entrevistaId,
            nombre_etiqueta: etiqueta.nombre_etiqueta,
            contenido: textoDto.contenido,
            fecha: new Date(textoDto.fecha),
            contexto: textoDto.contexto,
          });
          await this.textoRepository.save(texto);
        }
      }
    }
  }

  // MÉTODOS CRUD BÁSICOS
  async findAll(): Promise<Entrevista[]> {
    return this.entrevistaRepository.find({
      relations: ['estudiante', 'usuario', 'textos', 'textos.etiqueta'],
      order: { fecha: 'DESC' },
    });
  }

  async findByEstudiante(estudianteId: string): Promise<Entrevista[]> {
    return this.entrevistaRepository.find({
      where: { estudianteId },
      relations: ['estudiante', 'usuario', 'textos', 'textos.etiqueta'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Entrevista | null> {
    return this.entrevistaRepository.findOne({
      where: { id },
      relations: ['estudiante', 'usuario', 'textos', 'textos.etiqueta'],
    });
  }

  async getTextosByEntrevista(entrevistaId: string): Promise<Texto[]> {
    return this.textoRepository.find({
      where: { entrevistaId },
      relations: ['etiqueta'],
      order: { fecha: 'DESC' },
    });
  }
  
  async deleteEntrevista(id: string): Promise<void> {
    const entrevista = await this.entrevistaRepository.findOne({ where: { id } });
    if (!entrevista) {
      throw new BadRequestException('Entrevista no encontrada');
    }
    await this.entrevistaRepository.remove(entrevista);
  }

  async updateEntrevista(
    id: string,
    data: Partial<Pick<Entrevista, 'observaciones' | 'estado' | 'temas_abordados' | 'fecha' | 'nombre_Tutor' | 'duracion_minutos' | 'informacion_adicional'>>,
  ): Promise<Entrevista> {
    const entrevista = await this.entrevistaRepository.findOne({ where: { id } });
    if (!entrevista) {
      throw new BadRequestException('Entrevista no encontrada');
    }

    if (data.observaciones !== undefined) {
      entrevista.observaciones = data.observaciones;
    }
    if (data.informacion_adicional !== undefined) {
      entrevista.informacion_adicional = data.informacion_adicional;
    }
    if (data.estado) {
      entrevista.estado = data.estado as any;
    }
    if (Array.isArray(data.temas_abordados)) {
      entrevista.temas_abordados = data.temas_abordados;
    }
    if (data.fecha) {
      const base = new Date(data.fecha as any);
      entrevista.fecha = new Date(
        base.getFullYear(),
        base.getMonth(),
        base.getDate(),
        12, 0, 0, 0,
      );
    }
    if (data.nombre_Tutor) {
      entrevista.nombre_Tutor = data.nombre_Tutor;
    }
    if (typeof data.duracion_minutos === 'number') {
      entrevista.duracion_minutos = data.duracion_minutos;
    }

    return this.entrevistaRepository.save(entrevista);
  }

  async addTexto(
    entrevistaId: string,
    textoData: { nombre_etiqueta: string; contenido: string; contexto?: string; fecha?: string },
  ): Promise<Texto> {
    // Verificar que la entrevista existe
    const entrevista = await this.entrevistaRepository.findOne({
      where: { id: entrevistaId },
    });

    if (!entrevista) {
      throw new BadRequestException('Entrevista no encontrada');
    }

    // Asegurar que la etiqueta existe
    let etiqueta = await this.etiquetaRepository.findOne({
      where: { nombre_etiqueta: textoData.nombre_etiqueta },
    });

    if (!etiqueta) {
      // Crear la etiqueta si no existe
      etiqueta = this.etiquetaRepository.create({
        nombre_etiqueta: textoData.nombre_etiqueta,
      });
      await this.etiquetaRepository.save(etiqueta);
    }

    // Determinar fecha del texto: usar la provista o la de la entrevista
    const fechaTexto = textoData.fecha ? new Date(textoData.fecha) : new Date(entrevista.fecha);

    // Crear el texto
    const texto = this.textoRepository.create({
      entrevistaId: entrevistaId,
      nombre_etiqueta: textoData.nombre_etiqueta,
      contenido: textoData.contenido,
      fecha: fechaTexto,
      contexto: textoData.contexto,
    });

    return this.textoRepository.save(texto);
  }

  async updateTexto(
    entrevistaId: string,
    textoId: string,
    data: { contenido?: string; contexto?: string },
  ): Promise<Texto> {
    const texto = await this.textoRepository.findOne({ where: { id: textoId, entrevistaId } });
    if (!texto) {
      throw new BadRequestException('Texto no encontrado para esta entrevista');
    }
    if (typeof data.contenido === 'string') {
      texto.contenido = data.contenido;
    }
    if (typeof data.contexto === 'string') {
      texto.contexto = data.contexto;
    }
    return this.textoRepository.save(texto);
  }

  async deleteTexto(entrevistaId: string, textoId: string): Promise<void> {
    const texto = await this.textoRepository.findOne({ where: { id: textoId, entrevistaId } });
    if (!texto) {
      throw new BadRequestException('Texto no encontrado para esta entrevista');
    }
    await this.textoRepository.remove(texto);
  }
}
