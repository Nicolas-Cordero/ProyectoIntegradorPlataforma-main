import { semestre } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSemestreDto } from "./dto/create-semestre.dto";


export class SemestreRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  create(createSemestreDto: CreateSemestreDto): Promise<semestre> {
    try {
      return this.prisma.semestre.create({
        data: createSemestreDto,
      });
    } catch (error) {
      throw new Error('Error creating semestre');
    }
  }

  async findAll(): Promise<semestre[]> {
    return this.prisma.semestre.findMany();
  }

  async findOne(id: number): Promise<semestre | null> {
    return this.prisma.semestre.findUnique({
      where: { semestre_id: id },
    });
  }

  async remove(id: number): Promise<semestre> {
    try {
      return this.prisma.semestre.delete({
        where: { semestre_id: id },
      });
    } catch (error) {
      throw new Error('Error deleting semestre');
    } 
  }
}