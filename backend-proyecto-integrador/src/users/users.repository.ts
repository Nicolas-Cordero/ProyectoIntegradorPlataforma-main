import { Injectable } from "@nestjs/common";
import { audit_log, usuario } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "./interfaces/user.interface";


//TODO: revisar el tema del tipado de las clases del repository
//TODO: auth no deberia tener repository, deberia ser user.

@Injectable()
export class UsersRepository{
  constructor(private readonly prisma: PrismaService,) {}

  async registerNewUser(data: User): Promise<usuario>{
    try {
      const user = await this.prisma.usuario.create({
        data: data
      });

      return user
    } catch (error) {
      throw new Error("No se pudo crear el usuario")
    }
  }


  async updatePassword(
    rut_usuario: string,
    password: string
  ): Promise<usuario>{
    try {
      const user = await this.prisma.usuario.update({
        where: { rut_usuario },
        data: {
          password: password,
        },
      });

      return user; // si llegas acá, funcionó
    } catch (error) {
      // ejemplo: usuario no existe
      throw new Error('No se pudo actualizar el token');
    }
  }

  
  async updateResetToken(
    rut_usuario: string,
    hashed_token: string | null,
    expireDate: Date | null
  ):Promise<usuario> {
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
          fecha_hora: new Date(),
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


}