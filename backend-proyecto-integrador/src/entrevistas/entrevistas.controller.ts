import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { EntrevistasService } from './entrevistas.service';
import { CreateEntrevistaDto } from './dto/create-entrevista.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRol } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/interfaces/auth.interfaces';
import { UpdateEntrevistaDto } from './dto';

@Controller('entrevistas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRol.ADMIN, UserRol.TUTOR)
export class EntrevistasController {
  constructor(private readonly entrevistasService: EntrevistasService) {}

  @Post()
  create(
    @Body() createEntrevistaDto: CreateEntrevistaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.entrevistasService.create(
      createEntrevistaDto,
      user.rut_usuario,
    );
  }

  @Delete(':id_entrevista')
  @Roles(UserRol.ADMIN)
  delete(@Param('id_entrevista', ParseIntPipe) id_entrevista: number) {
    return this.entrevistasService.deleteEntrevista(id_entrevista);
  }

  //Busca todas las entrevistas
  @Get()
  findAll() {
    return this.entrevistasService.findAll();
  }

  //Busca todas las entrevistas
  @Get('estudiante/:rut')
  findAllByEstudiante(@Param('rut') rut_estudiante: string) {
    return this.entrevistasService.findAllByEstudiante(rut_estudiante);
  }

  //encuentra una entrevista por id
  @Get(':id_entrevista')
  findOne(@Param('id_entrevista', ParseIntPipe) id_entrevista: number) {
    return this.entrevistasService.findOne(id_entrevista);
  }

  //actualiza una entrevista
  @Patch(':id_entrevista')
  async update(
    @Param('id_entrevista', ParseIntPipe) id_entrevista: number,
    @Body() updateEntrevistaDto: UpdateEntrevistaDto,
  ) {
    return this.entrevistasService.updateEntrevista(
      id_entrevista,
      updateEntrevistaDto,
    );
  }
}
