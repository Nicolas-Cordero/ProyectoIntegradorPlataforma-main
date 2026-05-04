import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { estudiante } from "@prisma/client";


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


}