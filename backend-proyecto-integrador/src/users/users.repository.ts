import { Injectable } from '@nestjs/common';
import { audit_log, usuario, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

//TODO: revisar el tema del tipado de las clases del repository
//TODO: auth no deberia tener repository, deberia ser user.

// Campos sensibles que nunca deben salir en respuestas de API.
const OMIT_SENSITIVE = {
  password: true,
  reset_token: true,
  reset_token_expires: true,
} as const;

export type SafeUsuario = Omit<
  usuario,
  'password' | 'reset_token' | 'reset_token_expires'
>;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async registerNewUser(
    data: Prisma.usuarioUncheckedCreateInput,
  ): Promise<SafeUsuario> {
    return this.prisma.usuario.create({
      data,
      omit: OMIT_SENSITIVE,
    });
  }

  async update(
    rut_usuario: string,
    data: Prisma.usuarioUncheckedUpdateInput,
  ): Promise<SafeUsuario> {
    return this.prisma.usuario.update({
      where: { rut_usuario },
      data,
      omit: OMIT_SENSITIVE,
    });
  }

  /**
   * Actualiza el usuario y, si existe un estudiante con el mismo RUT, refleja en él
   * los campos compartidos (sincronización bilateral usuario → estudiante).
   */
  async updateWithEstudianteSync(
    rut_usuario: string,
    data: Prisma.usuarioUncheckedUpdateInput,
  ): Promise<SafeUsuario> {
    const compartidos: Prisma.estudianteUncheckedUpdateInput = {};
    if (data.nombre !== undefined) compartidos.nombre = data.nombre;
    if (data.apellido !== undefined) compartidos.apellido = data.apellido;
    if (data.email !== undefined) compartidos.email = data.email;
    if (data.telefono !== undefined) compartidos.telefono = data.telefono;

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.usuario.update({
        where: { rut_usuario },
        data,
        omit: OMIT_SENSITIVE,
      });

      if (Object.keys(compartidos).length > 0) {
        const estudiante = await tx.estudiante.findUnique({
          where: { rut_estudiante: rut_usuario },
        });
        if (estudiante) {
          await tx.estudiante.update({
            where: { rut_estudiante: rut_usuario },
            data: compartidos,
          });
        }
      }

      return user;
    });
  }

  updatePassword(
    rut_usuario: string,
    changePassWordDto: { password: string },
  ): Promise<SafeUsuario> {
    return this.prisma.usuario.update({
      where: { rut_usuario },
      data: {
        password: changePassWordDto.password,
      },
      omit: OMIT_SENSITIVE,
    });
  }

  async updateResetToken(
    rut_usuario: string,
    hashed_token: string | null,
    expireDate: Date | null,
  ): Promise<void> {
    await this.prisma.usuario.update({
      where: { rut_usuario },
      data: {
        reset_token: hashed_token,
        reset_token_expires: expireDate,
      },
    });
  }

  async updateLastLogin(rut_usuario: string): Promise<void> {
    await this.prisma.usuario.update({
      where: { rut_usuario },
      data: {
        ultimo_login: new Date(),
      },
    });
  }

  async addLoginAuditLog(rut_usuario: string): Promise<audit_log> {
    return this.prisma.audit_log.create({
      data: {
        rut_usuario: rut_usuario,
        created_at: new Date(),
        descripcion: 'login', //deuda tecnica
      },
    });
  }

  // Devuelve el usuario completo (con password) — solo para uso interno de auth.
  async findByRut(rut_usuario: string): Promise<usuario | null> {
    return this.prisma.usuario.findUnique({
      where: { rut_usuario },
    });
  }

  // Versión segura para respuestas de API: omite campos sensibles.
  async findByRutSafe(rut_usuario: string): Promise<SafeUsuario | null> {
    return this.prisma.usuario.findUnique({
      where: { rut_usuario },
      omit: OMIT_SENSITIVE,
    });
  }

  async findByEmail(email: string): Promise<usuario | null> {
    return this.prisma.usuario.findFirst({
      where: { email },
    });
  }

  // Excluye usuarios desactivados (ver `delete`, que ahora desactiva en vez
  // de borrar) — la vista de gestión de usuarios solo debe listar activos.
  async findAll(): Promise<SafeUsuario[]> {
    return this.prisma.usuario.findMany({
      where: { activo: true },
      omit: OMIT_SENSITIVE,
    });
  }

  /**
   * "Eliminar" un usuario es en realidad desactivarlo (activo = false) en vez
   * de borrar la fila: entrevista.rut_entrevistador e
   * historial_estado_carrera.rut_usuario dependen de este usuario, y son
   * historial de ESTUDIANTES (no del usuario) — no deben desaparecer porque
   * se dio de baja a un miembro del staff. `activo = false` ya bloquea el
   * login y la validación de JWT (ver auth.service/jwt.strategy). Las
   * sesiones activas (refresh_token) sí se revocan.
   */
  async delete(rut_usuario: string): Promise<SafeUsuario> {
    return this.prisma.$transaction(async (tx) => {
      await tx.refresh_token.deleteMany({ where: { rut_usuario } });
      return tx.usuario.update({
        where: { rut_usuario },
        data: { activo: false },
        omit: OMIT_SENSITIVE,
      });
    });
  }
}
