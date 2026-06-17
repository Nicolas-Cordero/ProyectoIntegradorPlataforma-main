import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { estudiante, Prisma } from "@prisma/client";
import { CreateEstudianteDto } from "./dto/create-estudiante.dto";
import { UpdateEstudianteDto } from "./dto/update-estudiante.dto";
import { estadoPermiteLogin } from "./estudiante.utils";


@Injectable()
export class EstudianteRepository{
  constructor(private readonly prisma: PrismaService,) {}

  async findEstudianteByRut(rut_estudiante: string): Promise<estudiante | null>{
    return this.prisma.estudiante.findUnique({
      where: {
        rut_estudiante: rut_estudiante,
      },
    });
  }

  async findEstudianteByRutComplete(rut_estudiante: string): Promise<estudiante | null>{
    return this.prisma.estudiante.findUnique({
      where: {
        rut_estudiante: rut_estudiante,
      },
      include: {
        carreras: {
          include: {
            universidad: true,
          },
        },
        familiares: true,
        beneficios: true,
        ramos: true,
        contactos_emergencia: true,
      },
    });
  }


  async findEstudianteByGeneracionId(generacion_id: number): Promise<estudiante[]>{
    return this.prisma.estudiante.findMany({
      where: { generacion_id },
    });
  }


  async findAllEstudiantes(): Promise<estudiante[]>{
    return this.prisma.estudiante.findMany();
  }


  async findByliceo(rbd_liceo: string): Promise<estudiante[]>{
    return this.prisma.estudiante.findMany({
      where:{
        rbd_liceo: rbd_liceo,
      },
    });
  }


  async findByUniversidad(codigo_universidad: number): Promise<estudiante[]> {
    return this.prisma.estudiante.findMany({
      where: {
        carreras: {
          some:{
            universidad: {
              codigo_universidad: codigo_universidad
            }
          }
        }
      }
    })
  }


  async create(createEstudianteDto: CreateEstudianteDto){
    try {
      return this.prisma.estudiante.create({
        data: createEstudianteDto,
      });
    } catch (error) {
      throw new InternalServerErrorException(`No se pudo crear el estudiante con rut: ${createEstudianteDto.rut_estudiante}`)
    }
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


  async update(rut_estudiante: string, updateEstudianteDto: UpdateEstudianteDto){
    try {
      return this.prisma.estudiante.update({
        where:{
          rut_estudiante: rut_estudiante,
        },
        data: updateEstudianteDto,
      });
    } catch (error) {
      throw new InternalServerErrorException(`No se pudo actualizar el estudiante con rut: ${rut_estudiante}`)
    }
  }


  /**
   * Actualiza el estudiante y refleja en su usuario (si existe) los campos
   * compartidos. El `estado` del estudiante determina `usuario.activo`.
   */
  async updateWithUserSync(rut_estudiante: string, updateEstudianteDto: UpdateEstudianteDto): Promise<estudiante> {
    const userData: Prisma.usuarioUncheckedUpdateInput = {};
    if (updateEstudianteDto.nombre !== undefined) userData.nombre = updateEstudianteDto.nombre;
    if (updateEstudianteDto.apellido !== undefined) userData.apellido = updateEstudianteDto.apellido;
    if (updateEstudianteDto.email !== undefined) userData.email = updateEstudianteDto.email;
    if (updateEstudianteDto.telefono !== undefined) userData.telefono = updateEstudianteDto.telefono;
    if (updateEstudianteDto.estado !== undefined) userData.activo = estadoPermiteLogin(updateEstudianteDto.estado);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const estudiante = await tx.estudiante.update({
          where: { rut_estudiante },
          data: updateEstudianteDto,
        });

        if (Object.keys(userData).length > 0) {
          const usuario = await tx.usuario.findUnique({ where: { rut_usuario: rut_estudiante } });
          if (usuario) {
            await tx.usuario.update({ where: { rut_usuario: rut_estudiante }, data: userData });
          }
        }

        return estudiante;
      });
    } catch (error) {
      throw new InternalServerErrorException(`No se pudo actualizar el estudiante con rut: ${rut_estudiante}`)
    }
  }


  async remove(rut_estudiante: string){
    try {
      return this.prisma.estudiante.delete({
        where: {
          rut_estudiante: rut_estudiante,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(`No se ha podido eliminar el estudiante: ${rut_estudiante}`)
    }
  }


  /**
   * Elimina el estudiante e inhabilita su usuario de login (activo = false),
   * conservando la cuenta para auditoría.
   */
  async removeWithUserDisable(rut_estudiante: string): Promise<estudiante> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const estudiante = await tx.estudiante.delete({ where: { rut_estudiante } });
        const usuario = await tx.usuario.findUnique({ where: { rut_usuario: rut_estudiante } });
        if (usuario) {
          await tx.usuario.update({ where: { rut_usuario: rut_estudiante }, data: { activo: false } });
        }
        return estudiante;
      });
    } catch (error) {
      throw new InternalServerErrorException(`No se ha podido eliminar el estudiante: ${rut_estudiante}`)
    }
  }

}