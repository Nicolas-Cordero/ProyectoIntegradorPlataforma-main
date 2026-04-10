import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { HistorialAcademicoService } from './historial_academico.service';
import { CreateHistorialAcademicoDto } from './dto/create-historial_academico.dto';
import { UpdateHistorialAcademicoDto } from './dto/update-historial_academico.dto';

@Controller('historial-academico')
export class HistorialAcademicoController {
  constructor(private readonly historialAcademicoService: HistorialAcademicoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createHistorialAcademicoDto: CreateHistorialAcademicoDto) {
    return await this.historialAcademicoService.create(createHistorialAcademicoDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.historialAcademicoService.findAll();
  }

  @Get('estudiante/:idEstudiante')
  @HttpCode(HttpStatus.OK)
  async findByEstudiante(@Param('idEstudiante') idEstudiante: string) {
    return await this.historialAcademicoService.findByEstudiante(idEstudiante);
  }

  // === ENDPOINTS DE AÑO/SEMESTRE ELIMINADOS ===
  // findByEstudianteAndSemestre y findBySemestre eliminados
  // Los campos año/semestre fueron migrados a periodo_academico

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.historialAcademicoService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateHistorialAcademicoDto: UpdateHistorialAcademicoDto) {
    return await this.historialAcademicoService.update(id, updateHistorialAcademicoDto);
  }

  @Post(':id/trayectoria')
  @HttpCode(HttpStatus.CREATED)
  async addTrayectoria(
    @Param('id') id: string,
    @Body() body: { trayectoria: string },
  ) {
    return await this.historialAcademicoService.addTrayectoria(id, body.trayectoria);
  }

  @Patch(':id/trayectoria/:index')
  @HttpCode(HttpStatus.OK)
  async updateTrayectoria(
    @Param('id') id: string,
    @Param('index') index: string,
    @Body() body: { trayectoria: string },
  ) {
    return await this.historialAcademicoService.updateTrayectoria(id, +index, body.trayectoria);
  }

  @Delete(':id/trayectoria/:index')
  @HttpCode(HttpStatus.OK)
  async deleteTrayectoria(
    @Param('id') id: string,
    @Param('index') index: string,
  ) {
    return await this.historialAcademicoService.deleteTrayectoria(id, +index);
  }

  @Delete(':id')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.historialAcademicoService.remove(id);
  }
}
