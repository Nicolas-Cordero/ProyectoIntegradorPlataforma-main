import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EntrevistasService } from './entrevistas.service';
import { CreateEntrevistaDto } from './dto/create-entrevista.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { Request } from 'express';

@Controller('entrevistas')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.TUTOR)
export class EntrevistasController {
  constructor(private readonly entrevistasService: EntrevistasService) {}

  @Post()
  async create(
    @Req() req: Request,
    @Body() createEntrevistaDto: CreateEntrevistaDto,
  ) {
    const userId = (req as any).user.id as string;
    return this.entrevistasService.create(createEntrevistaDto, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.entrevistasService.deleteEntrevista(id);
    return { message: 'Entrevista eliminada' };
  }

  @Get()
  async findAll() {
    return this.entrevistasService.findAll();
  }

  @Get('estudiante/:idEstudiante')
  async findOneBy(
    @Param('idEstudiante') idEstudiante: string,
  ) {
    return this.entrevistasService.findByEstudiante(idEstudiante);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<any>,
  ) {
    return this.entrevistasService.updateEntrevista(id, data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.entrevistasService.findOne(id);
  }

  @Get(':id/textos')
  async getTextos(@Param('id') id: string) {
    return this.entrevistasService.getTextosByEntrevista(id);
  }

  @Post(':id/textos')
  async addTexto(
    @Param('id') id: string,
    @Body() textoData: { nombre_etiqueta: string; contenido: string; contexto?: string; fecha?: string },
  ) {
    return this.entrevistasService.addTexto(id, textoData);
  }

  @Patch(':id/textos/:textoId')
  async updateTexto(
    @Param('id') id: string,
    @Param('textoId') textoId: string,
    @Body() data: { contenido?: string; contexto?: string },
  ) {
    return this.entrevistasService.updateTexto(id, textoId, data);
  }

  @Delete(':id/textos/:textoId')
  async deleteTexto(@Param('id') id: string, @Param('textoId') textoId: string) {
    await this.entrevistasService.deleteTexto(id, textoId);
    return { message: 'Texto eliminado' };
  }
}
