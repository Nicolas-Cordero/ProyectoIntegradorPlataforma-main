import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { EstudianteRepository } from './estudiante.repository';
import { estudiante, Prisma, UserRol } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { rutSinDV } from '../common/rut.util';
import { estadoPermiteLogin } from './estudiante.utils';


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

    // Usuario de login en paralelo (rol ESTUDIANTE): contraseña = RUT sin dígito
    // verificador, con cambio forzado; `activo` derivado del estado del estudiante.
    const hashedPassword = await bcrypt.hash(rutSinDV(createEstudianteDto.rut_estudiante), 10);
    const usuarioData: Prisma.usuarioUncheckedCreateInput = {
      rut_usuario: createEstudianteDto.rut_estudiante,
      nombre: createEstudianteDto.nombre,
      apellido: createEstudianteDto.apellido,
      email: createEstudianteDto.email,
      telefono: createEstudianteDto.telefono,
      rol: UserRol.ESTUDIANTE,
      password: hashedPassword,
      must_change_password: true,
      activo: estadoPermiteLogin(createEstudianteDto.estado),
    };

    try {
      return await this.estudianteRepo.createWithUser(createEstudianteDto, usuarioData);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ya existe un usuario con ese RUT o email');
      }
      throw error;
    }
  }


  findAll(soloActivos = false) {
    if (soloActivos) return this.estudianteRepo.findBecariosActivos();
    return this.estudianteRepo.findAllEstudiantes();
  }


  findByGeneracion(generacion_id: number): Promise<estudiante[]> {
    return this.estudianteRepo.findEstudianteByGeneracionId(generacion_id);
  }

  

  async findOneSimple(rut_estudiante: string) {
    const est = await this.estudianteRepo.findEstudianteByRutSimple(rut_estudiante);
    if (!est) {
      throw new NotFoundException(`Estudiante con RUT ${rut_estudiante} no encontrado`);
    }
    return est;
  }

  async findOneComplete(rut_estudiante: string) {
    const est = await this.estudianteRepo.findEstudianteByRutComplete(rut_estudiante);
    if (!est) {
      throw new NotFoundException(`Estudiante con RUT ${rut_estudiante} no encontrado`);
    }
    return est;
  }

  
  async findSortedByGeneracion(): Promise<Record<number, estudiante[]>> {
    const estudiantes = await this.estudianteRepo.findAllEstudiantes();
    const resultado: Record<number, estudiante[]> = {};

    for (const est of estudiantes) {
      if (!resultado[est.generacion_id]) {
        resultado[est.generacion_id] = [];
      }
      resultado[est.generacion_id].push(est);
    }

    return resultado;
  }



  update(rut_estudiante: string, updateEstudianteDto: UpdateEstudianteDto): Promise<estudiante> {
    // Sincroniza campos compartidos y el estado (activo) hacia el usuario.
    return this.estudianteRepo.updateWithUserSync(rut_estudiante, updateEstudianteDto);
  }



  remove(rut_estudiante: string): Promise<estudiante> {
    //hay que hacer un borrado seguro.
    //con todas las cosas que apuntan a estudiante
    //familiares, asociacion de beneficios, carreras, ramos, entrevistas, contactos de emergencia.
    // Inhabilita además el login del usuario asociado (activo = false).
    return this.estudianteRepo.removeWithUserDisable(rut_estudiante);
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
