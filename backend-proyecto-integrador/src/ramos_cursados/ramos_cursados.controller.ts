import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RamosCursadosService } from './ramos_cursados.service';
import { CreateRamosCursadosDto } from './dto/create-ramos_cursado.dto';
import { UpdateRamosCursadosDto } from './dto/update-ramos_cursado.dto';

@Controller('ramos-cursados')
export class RamosCursadosController {
  constructor(private readonly ramosCursadosService: RamosCursadosService) {}

  @Post()
  create(@Body() createRamosCursadosDto: CreateRamosCursadosDto) {
    return this.ramosCursadosService.create(createRamosCursadosDto);
  }

  @Get()
  findAll() {
    return this.ramosCursadosService.findAll();
  }

  @Get('estudiante/:estudianteId')
  findByEstudiante(
    @Param('estudianteId') estudianteId: string,
    @Query('periodo_academico_estudiante_id') periodoId?: string
  ) {
    const filtros = periodoId ? {
      periodo_academico_estudiante_id: periodoId
    } : undefined;
    return this.ramosCursadosService.findByEstudiante(estudianteId, filtros);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ramosCursadosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRamosCursadosDto: UpdateRamosCursadosDto) {
    return this.ramosCursadosService.update(id, updateRamosCursadosDto);
  }

  // === ENDPOINT fixSemestres ELIMINADO ===
  // Los campos año/semestre fueron migrados a periodo_academico

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ramosCursadosService.remove(id);
  }
}
