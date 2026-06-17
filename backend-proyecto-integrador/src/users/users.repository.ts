import { Injectable } from "@nestjs/common";
import { audit_log, usuario, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";


//TODO: revisar el tema del tipado de las clases del repository
//TODO: auth no deberia tener repository, deberia ser user.

@Injectable()
export class UsersRepository{
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  registerNewUser(data: Prisma.usuarioUncheckedCreateInput): Promise<usuario>{
    try {
      const user = this.prisma.usuario.create({
        data,
      });

      return user;
    } catch (error) {
      // ejemplo: usuario ya existe
      throw new Error('No se pudo crear el usuario');
    }
  }


  update(rut_usuario: string, data: Prisma.usuarioUncheckedUpdateInput): Promise<usuario>{
    try {
      const user = this.prisma.usuario.update({
        where: { rut_usuario },
        data,
      });

      return user;
    } catch (error) {
      // ejemplo: usuario no existe
      throw new Error('No se pudo actualizar el usuario');
    }
  }


  /**
   * Actualiza el usuario y, si existe un estudiante con el mismo RUT, refleja en él
   * los campos compartidos (sincronización bilateral usuario → estudiante).
   */
  async updateWithEstudianteSync(
    rut_usuario: string,
    data: Prisma.usuarioUncheckedUpdateInput,
  ): Promise<usuario> {
    const compartidos: Prisma.estudianteUncheckedUpdateInput = {};
    if (data.nombre !== undefined) compartidos.nombre = data.nombre;
    if (data.apellido !== undefined) compartidos.apellido = data.apellido;
    if (data.email !== undefined) compartidos.email = data.email;
    if (data.telefono !== undefined) compartidos.telefono = data.telefono;

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.usuario.update({ where: { rut_usuario }, data });

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

  updatePassword(rut_usuario: string, changePassWordDto: { password: string }): Promise<usuario>{
    try {
      const user = this.prisma.usuario.update({
        where: { rut_usuario },
        data: {
          password: changePassWordDto.password,
        },
      });

      return user;
    } catch (error) {

      throw new Error('No se pudo actualizar la contraseña');
    }
  }


  async updateResetToken(rut_usuario: string, hashed_token: string | null, expireDate: Date | null):Promise<usuario> {
    try {
      const user = await this.prisma.usuario.update({
        where: { rut_usuario },
        data: {
          reset_token: hashed_token,
          reset_token_expires: expireDate,
        },
      });

      return user; // si llegas acá, funcionó
    } catch (error) {
      // ejemplo: usuario no existe
      throw new Error('No se pudo actualizar el token');
    }
  }



  async updateLastLogin( rut_usuario:string ): Promise<usuario> {
    try {
      const user = await this.prisma.usuario.update({
        where: {rut_usuario},
        data: {
          ultimo_login: new Date(),
        }
      });

      return user
    } catch (error) {
      throw new Error('No se pudo actualizar el login');
    }
  };



  async addLoginAuditLog(rut_usuario: string): Promise<audit_log>{
    try {
      const audit = this.prisma.audit_log.create({
        data:{
          rut_usuario: rut_usuario,
          created_at: new Date(),
          descripcion: 'login', //deuda tecnica
        },
      });

      return audit;
    } catch (error) {
      throw new Error('No se pudo agregar el login a la tabla audit');
    }
  }



  async findByRut(rut_usuario: string): Promise<usuario | null>{
    return this.prisma.usuario.findUnique({
      where:{
        rut_usuario: rut_usuario,
      }
    });
  } 



  async findByEmail(email: string): Promise<usuario | null>{
    return this.prisma.usuario.findFirst({
      where:{
        email: email,
      }
    });
  }

  
//Metodo de testeo    
  async findAll(): Promise<usuario[]>{
    return this.prisma.usuario.findMany();
  }

  async delete(rut_usuario: string): Promise<usuario> {
    try {
      await this.prisma.audit_log.deleteMany({
        where: { rut_usuario }
      });

      return await this.prisma.usuario.delete({
        where: { rut_usuario }
      });
    } catch (error) {
      throw new Error('No se pudo eliminar el usuario');
    }
  }


}