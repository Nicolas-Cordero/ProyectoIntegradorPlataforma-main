import { Injectable, NotFoundException, Inject, forwardRef, ConflictException } from '@nestjs/common';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { EstudianteRepository } from './estudiante.repository';
import { estudiante } from '@prisma/client';


@Injectable()
export class EstudianteService {
  constructor(
    private readonly estudianteRepo: EstudianteRepository
  ) {}



  async create(createEstudianteDto: CreateEstudianteDto) {
    // Validar que no exista un estudiante con el mismo RUT
    const existing = await this.estudianteRepo.findEstudianteByRut(createEstudianteDto.rut_estudiante);
    if (existing) {
      throw new ConflictException(`Ya existe un estudiante con RUT ${createEstudianteDto.rut_estudiante}`);
    }
    return this.estudianteRepo.create(createEstudianteDto);
  }


  findAll() {
    return this.estudianteRepo.findAllEstudiantes();
  }


  findByGeneration(generacion: string): Promise<estudiante[]> {
    return this.estudianteRepo.findEstudianteByGeneracion(generacion);
  }

  

  async findOneSimple(rut_estudiante: string): Promise<estudiante> {
    const estudiante = await this.estudianteRepo.findEstudianteByRut(rut_estudiante);
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con RUT ${rut_estudiante} no encontrado`);
    }
    return estudiante
  }



  async findOneComplete(rut_estudiante: string): Promise<estudiante> {
    const estudiante = await this.estudianteRepo.findEstudianteByRutComplete(rut_estudiante);
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con RUT ${rut_estudiante} no encontrado`);
    }
    return estudiante;
  }

  async findSortedByGeneration(): Promise<{ [generacion: string]: estudiante[] }> {
    const estudiantes_generacion = {};
    const estudiantes = await this.estudianteRepo.findAllEstudiantes();

    for (const estudiante of estudiantes) {
      if (!estudiantes_generacion[estudiante.generacion]) {
        estudiantes_generacion[estudiante.generacion] = [];
      }

      estudiantes_generacion[estudiante.generacion].push(estudiante);
    }

    return estudiantes_generacion;
  }



  update(rut_estudiante: string, updateEstudianteDto: UpdateEstudianteDto): Promise<estudiante> {
    return this.estudianteRepo.update(rut_estudiante, updateEstudianteDto);
  }



  remove(rut_estudiante: string): Promise<estudiante> {
    //hay que hacer un borrado seguro.
    //con todas las cosas que apuntan a estudiante
    //familiares, asociacion de beneficios, carreras, ramos, entrevistas, contactos de emergencia.
    return this.estudianteRepo.remove(rut_estudiante);
  }

  //la revisaremos
  // para retornar estadisiticas.
  // async findStadistics() {
  //   const gensInfo = await this.estudianteRepository
  //     .createQueryBuilder('estudiante')
  //     .leftJoin('estado_academico', 'estado', 'estado.estudiante_id = estudiante.id_estudiante')
  //     .select('estudiante.generacion', 'generacion')
  //     .addSelect('COUNT(estudiante.id_estudiante)', 'total')
  //     .addSelect(
  //       "SUM(CASE WHEN estado.status = 'activo' THEN 1 ELSE 0 END)",
  //       'activos',
  //     )
  //     .groupBy('estudiante.generacion')
  //     .getRawMany(); // retorna array de objs { generacion: string, total: string, activos: string }

  //   const generaciones = gensInfo.map((r) => ({
  //     generacion: r.generacion,
  //     total: parseInt(r.total, 10),
  //     activos: parseInt(r.activos, 10),
  //   }));

  //   const totalGens = generaciones.length;
  //   const totalStudents = generaciones.reduce((sum, r) => sum + r.total, 0);
  //   const totalActives = generaciones.reduce((sum, r) => sum + r.activos, 0);

  //   return {
  //     generacionesTotal: totalGens,
  //     estudiantesTotal: totalStudents,
  //     activosTotal: totalActives,
  //     generaciones: generaciones,
  //   };
  // }


}
