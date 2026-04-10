import { Injectable, NotFoundException, Inject, forwardRef, ConflictException } from '@nestjs/common';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { FamiliaService } from '../familia/familia.service';
import { InformacionAcademicaService } from '../informacion_academica/informacion_academica.service';
import { HistorialAcademicoService } from '../historial_academico/historial_academico.service';
import { InstitucionService } from '../institucion/institucion.service';
import { EntrevistasService } from '../entrevistas/entrevistas.service';
import { InformacionContactoService } from '../informacion-contacto/informacion-contacto.service';
import { EstadoAcademicoService } from '../estado-academico/estado-academico.service';
import { HistorialAcademico } from '../historial_academico/entities/historial_academico.entity';
import { InformacionAcademica } from '../informacion_academica/entities/informacion_academica.entity';
import { InformacionContacto } from '../informacion-contacto/entities/informacion-contacto.entity';
import { EstadoAcademico } from '../estado-academico/entities/estado-academico.entity';
import { BeneficioEstudiante } from '../beneficios/entities/beneficio-estudiante.entity';
import { Familiar } from '../familiar/entities/familiar.entity';
import { Familia } from '../familia/entities/familia.entity';
import { InformacionAdmision } from '../informacion-admision/entities/informacion-admision.entity';
import { EnsayoPaes } from '../informacion-admision/entities/ensayo-paes.entity';
import { Entrevista } from '../entrevistas/entities/entrevista.entity';
import { PeriodoAcademicoEstudiante } from '../periodo-academico/entities/periodo-academico-estudiante.entity';
import { RamosCursados } from '../ramos_cursados/entities/ramos_cursado.entity';

@Injectable()
export class EstudianteService {
  constructor(
    @InjectRepository(Estudiante)
    private estudianteRepository: Repository<Estudiante>,
    private readonly familiaService: FamiliaService,
    private readonly informacionAcademicaService: InformacionAcademicaService,
    private readonly historialAcademicoService: HistorialAcademicoService,
    private readonly institucionService: InstitucionService,
    private readonly informacionContactoService: InformacionContactoService,
    private readonly estadoAcademicoService: EstadoAcademicoService,
    @Inject(forwardRef(() => EntrevistasService))
    private readonly entrevistasService: EntrevistasService,
  ) {}

  async create(createEstudianteDto: CreateEstudianteDto) {
    // Extraer campos de contacto antes de crear estudiante
    const { email, telefono, direccion, ...estudianteData } = createEstudianteDto;

    // Crear estudiante sin campos de contacto
    const estudiante = this.estudianteRepository.create(estudianteData);
    let estudianteGuardado: Estudiante;

    try {
      estudianteGuardado = await this.estudianteRepository.save(estudiante);
    } catch (error: any) {
      // Capturar errores de llave única (ej. RUT duplicado)
      const isDuplicateKey = error?.code === '23505' || (typeof error?.message === 'string' && error.message.includes('duplicate key'));
      if (isDuplicateKey) {
        throw new ConflictException('El RUT ya está registrado para otro estudiante');
      }
      throw error;
    }

    // Crear información de contacto si se proporcionaron datos
    if (email || telefono || direccion) {
      try {
        await this.informacionContactoService.create({
          estudiante_id: estudianteGuardado.id_estudiante,
          email: email || undefined,
          telefono: telefono || undefined,
          direccion: direccion || undefined,
        });
      } catch (error) {
        // Si falla, continuar - el contacto se puede agregar después
        console.warn('No se pudo crear información de contacto:', error.message);
      }
    }

    // Crear estado académico por defecto (activo)
    try {
      await this.estadoAcademicoService.create({
        estudiante_id: estudianteGuardado.id_estudiante,
        status: 'activo' as any,
        status_detalle: 'Estudiante recién ingresado',
      });
    } catch (error) {
      console.warn('No se pudo crear estado académico:', error.message);
    }

    await this.familiaService.create({
      id_estudiante: estudianteGuardado.id_estudiante,
    });

    await this.informacionAcademicaService.create({
      id_estudiante: estudianteGuardado.id_estudiante,
    });

    await this.historialAcademicoService.create({
      id_estudiante: estudianteGuardado.id_estudiante,
    });

    // Ya no se crea entrevista inicial automáticamente; se hace cuando el usuario la registra.

    // Si se proporciona id_institucion en el DTO, no se crea institución por defecto
    // El frontend o usuario debe asignar la institución posteriormente si es necesario

    return estudianteGuardado;
  }

  findAll() {
    return this.estudianteRepository.find();
  }

  async findStadistics() {
    const gensInfo = await this.estudianteRepository
      .createQueryBuilder('estudiante')
      .leftJoin('estado_academico', 'estado', 'estado.estudiante_id = estudiante.id_estudiante')
      .select('estudiante.generacion', 'generacion')
      .addSelect('COUNT(estudiante.id_estudiante)', 'total')
      .addSelect(
        "SUM(CASE WHEN estado.status = 'activo' THEN 1 ELSE 0 END)",
        'activos',
      )
      .groupBy('estudiante.generacion')
      .getRawMany(); // retorna array de objs { generacion: string, total: string, activos: string }

    const generaciones = gensInfo.map((r) => ({
      generacion: r.generacion,
      total: parseInt(r.total, 10),
      activos: parseInt(r.activos, 10),
    }));

    const totalGens = generaciones.length;
    const totalStudents = generaciones.reduce((sum, r) => sum + r.total, 0);
    const totalActives = generaciones.reduce((sum, r) => sum + r.activos, 0);

    return {
      generacionesTotal: totalGens,
      estudiantesTotal: totalStudents,
      activosTotal: totalActives,
      generaciones: generaciones,
    };
  }

  async findByGeneration(generation: string) {
    const estudiantes = await this.estudianteRepository.find({
      where: { generacion: generation },
      relations: ['institucion', 'informacionAcademica'],
      order: { nombre: 'ASC' },
    });

    // Cargar el estado académico para cada estudiante
    const estadosPromises = estudiantes.map(async (estudiante) => {
      try {
        const estado = await this.estadoAcademicoService.findByEstudiante(estudiante.id_estudiante);
        return { ...estudiante, estado: estado?.status || 'Activo' };
      } catch {
        return { ...estudiante, estado: 'Activo' };
      }
    });

    return await Promise.all(estadosPromises);
  }

async findOne(id: string) {
  const estudiante = await this.estudianteRepository.findOne({
    where: { id_estudiante: id },
    relations: [
      'institucion',             
      'informacionAcademica',     
      'historialesAcademicos',    
      'ramosCursados',         
        'entrevistas',              
        'familia',
    ],
  });
  
  if (!estudiante) {
    throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
  }
  
  return estudiante;
}

  update(id: string, updateEstudianteDto: UpdateEstudianteDto) {
    return this.actualizarEstudianteYDominios(id, updateEstudianteDto);
  }

  private async actualizarEstudianteYDominios(
    id: string,
    updateEstudianteDto: UpdateEstudianteDto,
  ) {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id_estudiante: id },
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
    }

    const {
      // Campos que pertenecen a informacion_contacto
      email,
      telefono,
      direccion,

      // Campos que pertenecen a estado_academico
      status_detalle,
      semestres_suspendidos,
      semestres_total_carrera,

      // Resto de campos para la tabla estudiante
      ...restoCampos
    } = updateEstudianteDto;

    // === Actualizar tabla estudiante (solo columnas existentes) ===
    const camposPermitidos: Array<keyof UpdateEstudianteDto> = [
      'nombre',
      'rut',
      'fecha_de_nacimiento',
      'genero',
      'tipo_de_estudiante',
      'generacion',
      'numero_carrera',
      'observaciones',
      'institucionId',
      'id_institucion',
      'foto_url',
    ];

    const payloadEstudiante: Record<string, any> = {};

    for (const campo of camposPermitidos) {
      if (restoCampos[campo] !== undefined) {
        // Soportar institucionId (camelCase) mapeado a id_institucion (columna)
        if (campo === 'institucionId') {
          payloadEstudiante['id_institucion'] = restoCampos[campo];
        } else {
          payloadEstudiante[campo] = restoCampos[campo];
        }
      }
    }

    if (Object.keys(payloadEstudiante).length > 0) {
      await this.estudianteRepository.update(id, payloadEstudiante);
    }

    // === Actualizar/crear informacion_contacto ===
    if (email !== undefined || telefono !== undefined || direccion !== undefined) {
      await this.informacionContactoService.upsertByEstudiante(id, {
        email,
        telefono,
        direccion,
      });
    }

    // === Actualizar/crear estado_academico ===
    const payloadEstado: Record<string, any> = {};
    if (status_detalle !== undefined) payloadEstado.status_detalle = status_detalle;
    if (semestres_suspendidos !== undefined) {
      payloadEstado.semestres_suspendidos = semestres_suspendidos;
    }
    if (semestres_total_carrera !== undefined) {
      // En la entidad el campo se llama semestres_totales_carrera
      payloadEstado.semestres_totales_carrera = semestres_total_carrera;
    }

    if (Object.keys(payloadEstado).length > 0) {
      await this.estadoAcademicoService.upsertByEstudiante(id, payloadEstado as any);
    }

    // Devolver el estudiante actualizado con sus relaciones principales
    return this.findOne(id);
  }

  async remove(id: string) {
    // Borrado seguro en cascada por ausencia de onDelete en varias FK
    return this.estudianteRepository.manager.transaction(async (manager) => {
      // Periodos y ramos asociados
      const periodos = await manager.find(PeriodoAcademicoEstudiante, {
        where: { estudiante_id: id },
      });
      const periodosIds = periodos.map((p) => p.id_periodo_academico_estudiante);
      if (periodosIds.length) {
        await manager.delete(RamosCursados, {
          periodo_academico_estudiante_id: In(periodosIds),
        });
      }

      // Tablas dependientes directas
      await manager.delete(InformacionContacto, { estudiante_id: id });
      await manager.delete(EstadoAcademico, { estudiante_id: id });
      await manager.delete(InformacionAcademica, { estudiante: { id_estudiante: id } as any });
      await manager.delete(HistorialAcademico, { estudiante: { id_estudiante: id } as any });
      await manager.delete(BeneficioEstudiante, { estudiante_id: id });
      await manager.delete(Familiar, { estudiante_id: id });
      await manager.delete(Familia, { estudiante: { id_estudiante: id } as any });
      await manager.delete(EnsayoPaes, { estudiante_id: id });
      await manager.delete(InformacionAdmision, { estudiante_id: id });
      await manager.delete(Entrevista, { estudianteId: id });
      await manager.delete(PeriodoAcademicoEstudiante, { estudiante_id: id });

      // Finalmente, el estudiante
      await manager.delete(Estudiante, { id_estudiante: id });
    });
  }
}
