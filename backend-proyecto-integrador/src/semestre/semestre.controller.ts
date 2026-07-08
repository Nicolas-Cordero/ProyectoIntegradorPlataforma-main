import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SemestreService } from './semestre.service';
import { CreateSemestreDto } from './dto/create-semestre.dto';
import { LinkCarreraDto } from './dto/link-carrera.dto';
import { CerrarSemestreDto } from './dto/cerrar-semestre.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRol } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/interfaces/auth.interfaces';

@Controller('semestre')
export class SemestreController {
  constructor(private readonly semestreService: SemestreService) {}

  @Post()
  @Roles(UserRol.ADMIN)
  create(@Body() createSemestreDto: CreateSemestreDto) {
    return this.semestreService.create(createSemestreDto);
  }

  // Rutas con segmentos literales deben declararse ANTES de las parametrizadas.

  @Get('by-carrera/:codigo_carrera')
  @Roles(UserRol.ADMIN, UserRol.TUTOR, UserRol.ESTUDIANTE)
  getByCarrera(@Param('codigo_carrera', ParseIntPipe) codigo_carrera: number) {
    return this.semestreService.getByCarrera(codigo_carrera);
  }

  @Post('link-carrera')
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  @HttpCode(200)
  linkCarrera(@Body() dto: LinkCarreraDto) {
    return this.semestreService.linkCarrera(
      dto.semestre_id,
      dto.codigo_carrera,
    );
  }

  @Delete('unlink-carrera')
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  @HttpCode(200)
  unlinkCarrera(@Body() dto: LinkCarreraDto) {
    return this.semestreService.unlinkCarrera(
      dto.semestre_id,
      dto.codigo_carrera,
    );
  }

  // Único camino para cerrar un semestre: exige rol admin/tutor y valida que
  // todos los ramos (no eliminados) tengan nota final antes de calcular sus
  // estados y marcar el semestre como cerrado. Ningún estudiante puede
  // disparar esto desde /ramo/me, así que cambiar el estado de sus propios
  // ramos nunca cierra el semestre.
  @Post('cerrar')
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  @HttpCode(200)
  cerrarSemestre(@Body() dto: CerrarSemestreDto) {
    return this.semestreService.cerrarSemestre(
      dto.semestre_id,
      dto.codigo_carrera,
    );
  }

  // Certificado de notas del semestre: un solo documento por carrera+semestre
  // (reemplaza al certificado por ramo que vivía en /ramo/me/:id_ramo/certificado).
  @Post('me/:semestre_id/carrera/:codigo_carrera/certificado')
  @Roles(UserRol.ESTUDIANTE)
  @UseInterceptors(FileInterceptor('certificado', { storage: memoryStorage() }))
  async uploadMyCertificado(
    @CurrentUser() user: AuthenticatedUser,
    @Param('semestre_id', ParseIntPipe) semestre_id: number,
    @Param('codigo_carrera', ParseIntPipe) codigo_carrera: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file || file.mimetype !== 'application/pdf') {
      throw new BadRequestException('El archivo debe ser un PDF');
    }
    return this.semestreService.uploadCertificado(
      semestre_id,
      codigo_carrera,
      user.rut_usuario,
      file,
    );
  }

  @Get()
  findAll() {
    return this.semestreService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.semestreService.findOne(id);
  }

  @Delete(':id')
  @Roles(UserRol.ADMIN)
  remove() {
    return this.semestreService.remove();
  }
}
