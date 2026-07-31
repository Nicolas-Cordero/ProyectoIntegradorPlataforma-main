import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { estudiante, EstadoEstudiante, Prisma } from '@prisma/client';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';

@Injectable()
export class EstudianteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findEstudianteByRut(
    rut_estudiante: string,
  ): Promise<estudiante | null> {
    return this.prisma.estudiante.findUnique({
      where: {
        rut_estudiante: rut_estudiante,
      },
    });
  }

  // Para validar en bloque (importación masiva) qué RUT/email ya pertenecen
  // a un estudiante existente.
  async findManyByRuts(
    ruts: string[],
  ): Promise<Pick<estudiante, 'rut_estudiante'>[]> {
    return this.prisma.estudiante.findMany({
      where: { rut_estudiante: { in: ruts } },
      select: { rut_estudiante: true },
    });
  }

  async findManyByEmails(
    emails: string[],
  ): Promise<Pick<estudiante, 'email'>[]> {
    return this.prisma.estudiante.findMany({
      where: { email: { in: emails } },
      select: { email: true },
    });
  }

  /**
   * Devuelve el estudiante con los datos mínimos que necesita la vista de perfil
   * simple: generación, nombre del liceo y nombre de la carrera, todo en una
   * sola query sin N+1.
   */
  async findEstudianteByRutSimple(rut_estudiante: string) {
    return this.prisma.estudiante.findUnique({
      where: { rut_estudiante },
      include: {
        generacion_rel: { select: { id: true, año: true, descripcion: true } },
        liceo: { select: { nombre: true } },
        carreras: { select: { nombre: true, estado: true } },
      },
    });
  }

  /**
   * Devuelve el estudiante con toda la información necesaria para la vista de
   * detalle completo: generación, liceo, PAES, carreras con universidad, y
   * familiares de emergencia. Todo en una sola query sin N+1.
   */
  async findEstudianteByRutComplete(rut_estudiante: string) {
    return this.prisma.estudiante.findUnique({
      where: { rut_estudiante },
      include: {
        generacion_rel: true,
        liceo: true,
        paes: true,
        carreras: { include: { universidad: true } },
        familiares: true,
        beneficios: true,
        // include semestre: el frontend necesita year/tipo/semestre para
        // calcular el último semestre cursado (perfil del estudiante).
        ramos: { include: { semestre: true } },
        contactos_emergencia: true,
      },
    });
  }

  /**
   * Incluye `carreras: { estado }` porque EstudianteService las necesita para
   * derivar el `estado` agregado del estudiante (ver derivarEstado).
   */
  async findEstudianteByGeneracionId(generacion_id: number) {
    return this.prisma.estudiante.findMany({
      where: { generacion_id },
      include: {
        carreras: { select: { estado: true } },
      },
    });
  }

  /**
   * Incluye `carreras: { estado }` porque EstudianteService las necesita para
   * derivar el `estado` agregado del estudiante (ver derivarEstado).
   */
  async findAllEstudiantes() {
    return this.prisma.estudiante.findMany({
      include: {
        carreras: { select: { estado: true } },
      },
    });
  }

  /**
   * Lista solo los estudiantes ACTIVOS con los datos mínimos necesarios para
   * la vista de becarios: generación, liceo y carrera con universidad, todo en
   * una sola query sin N+1.
   *
   * El filtro replica la regla de `EstudianteService.derivarEstado`: un
   * estudiante es ACTIVO si tiene alguna carrera ACTIVA **o si aún no tiene
   * carreras registradas** (estado por defecto).
   */
  async findBecariosActivos() {
    return this.prisma.estudiante.findMany({
      where: {
        OR: [
          { carreras: { some: { estado: EstadoEstudiante.ACTIVO } } },
          { carreras: { none: {} } },
        ],
      },
      include: {
        generacion_rel: { select: { id: true, año: true } },
        liceo: { select: { nombre: true } },
        carreras: {
          select: {
            nombre: true,
            estado: true,
            universidad: { select: { nombre: true } },
          },
        },
      },
    });
  }

  async findByliceo(rbd_liceo: string): Promise<estudiante[]> {
    return this.prisma.estudiante.findMany({
      where: {
        rbd_liceo: rbd_liceo,
      },
    });
  }

  async findByUniversidad(codigo_universidad: number): Promise<estudiante[]> {
    return this.prisma.estudiante.findMany({
      where: {
        carreras: {
          some: {
            universidad: {
              codigo_universidad: codigo_universidad,
            },
          },
        },
      },
    });
  }

  async create(createEstudianteDto: CreateEstudianteDto) {
    return this.prisma.estudiante.create({
      data: createEstudianteDto,
    });
  }

  /**
   * Crea el estudiante y, en la misma transacción, su usuario de login.
   * `usuarioData` ya viene con la contraseña hasheada y el rol ESTUDIANTE.
   */
  async createWithUser(
    estudianteData: CreateEstudianteDto,
    usuarioData: Prisma.usuarioUncheckedCreateInput,
  ): Promise<estudiante> {
    return this.prisma.$transaction(async (tx) => {
      const estudiante = await tx.estudiante.create({ data: estudianteData });
      await tx.usuario.create({ data: usuarioData });
      return estudiante;
    });
  }

  /**
   * Crea en una sola transacción todos los estudiantes del lote y sus usuarios
   * de login. Si cualquiera de los dos `createMany` falla (RUT/email duplicado,
   * RBD inexistente, etc.), la transacción hace rollback y no queda ningún
   * registro: garantiza la carga masiva "todo o nada".
   *
   * `usuariosData` ya viene con las contraseñas hasheadas (el hash de bcrypt se
   * hace fuera de la transacción para no agotar su timeout con lotes grandes).
   */
  async createManyWithUsers(
    estudiantesData: CreateEstudianteDto[],
    usuariosData: Prisma.usuarioUncheckedCreateInput[],
  ): Promise<number> {
    return this.prisma.$transaction(
      async (tx) => {
        await tx.estudiante.createMany({ data: estudiantesData });
        await tx.usuario.createMany({ data: usuariosData });
        return estudiantesData.length;
      },
      { timeout: 60000, maxWait: 15000 },
    );
  }

  async update(
    rut_estudiante: string,
    updateEstudianteDto: UpdateEstudianteDto,
  ) {
    return this.prisma.estudiante.update({
      where: {
        rut_estudiante: rut_estudiante,
      },
      data: updateEstudianteDto,
    });
  }

  /**
   * Actualiza el estudiante y refleja en su usuario (si existe) los campos
   * compartidos. El `estado` del estudiante determina `usuario.activo`.
   */
  async updateWithUserSync(
    rut_estudiante: string,
    updateEstudianteDto: UpdateEstudianteDto,
  ): Promise<estudiante> {
    const userData: Prisma.usuarioUncheckedUpdateInput = {};
    if (updateEstudianteDto.nombre !== undefined)
      userData.nombre = updateEstudianteDto.nombre;
    if (updateEstudianteDto.apellido !== undefined)
      userData.apellido = updateEstudianteDto.apellido;
    if (updateEstudianteDto.email !== undefined)
      userData.email = updateEstudianteDto.email;
    if (updateEstudianteDto.telefono !== undefined)
      userData.telefono = updateEstudianteDto.telefono;

    return this.prisma.$transaction(async (tx) => {
      const estudiante = await tx.estudiante.update({
        where: { rut_estudiante },
        data: updateEstudianteDto,
      });

      if (Object.keys(userData).length > 0) {
        const usuario = await tx.usuario.findUnique({
          where: { rut_usuario: rut_estudiante },
        });
        if (usuario) {
          await tx.usuario.update({
            where: { rut_usuario: rut_estudiante },
            data: userData,
          });
        }
      }

      return estudiante;
    });
  }

  /**
   * Elimina el estudiante y todo lo que le pertenece exclusivamente
   * (familiares, beneficios asignados, carreras con sus ramos/vínculos a
   * semestre/historial de estado, ramos sueltos, entrevistas con sus
   * comentarios, y su registro PAES), e inhabilita su usuario de login
   * (activo = false) conservando la cuenta para auditoría.
   * `firma_acuerdo` no se maneja acá porque ya tiene onDelete: Cascade.
   */
  async removeWithUserDisable(rut_estudiante: string): Promise<estudiante> {
    return this.prisma.$transaction(async (tx) => {
      const carreras = await tx.carrera.findMany({
        where: { rut_estudiante },
        select: { codigo_carrera: true },
      });
      const codigosCarrera = carreras.map((c) => c.codigo_carrera);

      await tx.ramo.deleteMany({ where: { rut_estudiante } });
      if (codigosCarrera.length > 0) {
        await tx.semestre_carrera.deleteMany({
          where: { codigo_carrera: { in: codigosCarrera } },
        });
        await tx.historial_estado_carrera.deleteMany({
          where: { codigo_carrera: { in: codigosCarrera } },
        });
      }
      await tx.carrera.deleteMany({ where: { rut_estudiante } });

      await tx.comentario.deleteMany({
        where: { entrevista: { rut_estudiante } },
      });
      await tx.entrevista.deleteMany({ where: { rut_estudiante } });

      await tx.familiar.deleteMany({ where: { rut_estudiante } });
      await tx.contacto_emergencia.deleteMany({ where: { rut_estudiante } });
      await tx.beneficio_estudiante.deleteMany({ where: { rut_estudiante } });
      await tx.paes.deleteMany({ where: { rut_estudiante } });

      const estudiante = await tx.estudiante.delete({
        where: { rut_estudiante },
      });

      const usuario = await tx.usuario.findUnique({
        where: { rut_usuario: rut_estudiante },
      });
      if (usuario) {
        await tx.usuario.update({
          where: { rut_usuario: rut_estudiante },
          data: { activo: false },
        });
      }
      return estudiante;
    });
  }
}
