import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { RamoService } from './ramo.service';
import { CreateRamoDto } from './dto/create-ramo.dto';
import { UpdateRamoDto } from './dto/update-ramo.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRol } from '@prisma/client';

@Controller('ramo')
export class RamoController {
  constructor(private readonly ramoService: RamoService) {}

  @Post()
  @Roles(UserRol.ADMIN, UserRol.TUTOR, UserRol.ESTUDIANTE)
  create(@Body() createRamoDto: CreateRamoDto) {
    return this.ramoService.create(createRamoDto);
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
  @Roles(UserRol.ADMIN, UserRol.TUTOR, UserRol.ESTUDIANTE)
  update(@Param('id_ramo', ParseIntPipe) id_ramo: number, @Body() updateRamoDto: UpdateRamoDto) {
    return this.ramoService.update(id_ramo, updateRamoDto);
  }

  @Delete(':id_ramo')
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  remove(@Param('id_ramo', ParseIntPipe) id_ramo: number) {
    return this.ramoService.remove(id_ramo);
  }
}
