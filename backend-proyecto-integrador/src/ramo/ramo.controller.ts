import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, BadRequestException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { RamoService } from './ramo.service';
import { CreateRamoDto } from './dto/create-ramo.dto';
import { CreateRamoMeDto } from './dto/create-ramo-me.dto';
import { UpdateRamoDto } from './dto/update-ramo.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRol } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/interfaces/auth.interfaces';

@Controller('ramo')
export class RamoController {
  constructor(private readonly ramoService: RamoService) {}

  @Post()
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  create(@Body() createRamoDto: CreateRamoDto) {
    return this.ramoService.create(createRamoDto);
  }

  // ── Endpoints propios del estudiante (rut tomado del JWT) ─────────────────────
  // Deben declararse ANTES de las rutas con :id_ramo para no ser capturados por ellas.

  @Get('me')
  @Roles(UserRol.ESTUDIANTE)
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.ramoService.findAllByEstudiante(user.rut_usuario);
  }

  @Post('me')
  @Roles(UserRol.ESTUDIANTE)
  createMine(@CurrentUser() user: AuthenticatedUser, @Body() createRamoDto: CreateRamoMeDto) {
    return this.ramoService.createForEstudiante(user.rut_usuario, createRamoDto);
  }

  @Patch('me/:id_ramo')
  @Roles(UserRol.ESTUDIANTE)
  updateMine(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id_ramo', ParseIntPipe) id_ramo: number,
    @Body() updateRamoDto: UpdateRamoDto,
  ) {
    return this.ramoService.updateOwn(id_ramo, user.rut_usuario, updateRamoDto);
  }

  @Post('me/:id_ramo/certificado')
  @Roles(UserRol.ESTUDIANTE)
  @UseInterceptors(FileInterceptor('certificado', { storage: memoryStorage() }))
  async uploadMyCertificado(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id_ramo', ParseIntPipe) id_ramo: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file || file.mimetype !== 'application/pdf') {
      throw new BadRequestException('El archivo debe ser un PDF');
    }
    return this.ramoService.uploadCertificado(id_ramo, user.rut_usuario, file);
  }

  // Rutas con segmentos literales ANTES de rutas con parámetros puros para evitar ambigüedad
  @Get('carrera/:codigo_carrera')
  findAllByCarrera(@Param('codigo_carrera', ParseIntPipe) codigo_carrera: number) {
    return this.ramoService.findAllByCarrera(codigo_carrera);
  }

  @Get(':id_ramo')
  findOne(@Param('id_ramo', ParseIntPipe) id_ramo: number) {
    return this.ramoService.findOne(id_ramo);
  }

  @Patch(':id_ramo')
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  update(@Param('id_ramo', ParseIntPipe) id_ramo: number, @Body() updateRamoDto: UpdateRamoDto) {
    return this.ramoService.update(id_ramo, updateRamoDto);
  }

  @Delete(':id_ramo')
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  remove(@Param('id_ramo', ParseIntPipe) id_ramo: number) {
    return this.ramoService.remove(id_ramo);
  }
}
