import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InformacionAcademicaService } from './informacion_academica.service';
import { CreateInformacionAcademicaDto } from './dto/create-informacion_academica.dto';
import { UpdateInformacionAcademicaDto } from './dto/update-informacion_academica.dto';

@Controller('informacion-academica')
export class InformacionAcademicaController {
  constructor(private readonly informacionAcademicaService: InformacionAcademicaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createInformacionAcademicaDto: CreateInformacionAcademicaDto) {
    return await this.informacionAcademicaService.create(createInformacionAcademicaDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.informacionAcademicaService.findAll();
  }

  @Get('estudiante/:idEstudiante')
  @HttpCode(HttpStatus.OK)
  async findByEstudiante(@Param('idEstudiante') idEstudiante: string) {
    return await this.informacionAcademicaService.findByEstudiante(idEstudiante);
  }

  @Patch('estudiante/:idEstudiante')
  @HttpCode(HttpStatus.OK)
  async upsertByEstudiante(
    @Param('idEstudiante') idEstudiante: string,
    @Body() payload: UpdateInformacionAcademicaDto,
  ) {
    return await this.informacionAcademicaService.upsertByEstudiante(idEstudiante, payload);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.informacionAcademicaService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateInformacionAcademicaDto: UpdateInformacionAcademicaDto) {
    return await this.informacionAcademicaService.update(id, updateInformacionAcademicaDto);
  }

  @Patch(':id/promedio/:nivel')
  @HttpCode(HttpStatus.OK)
  async updatePromedio(
    @Param('id') id: string,
    @Param('nivel') nivel: '1' | '2' | '3' | '4',
    @Body() body: { promedio: number },
  ) {
    return await this.informacionAcademicaService.updatePromedio(id, nivel, body.promedio);
  }

  // === ENDPOINTS DE ENSAYO PAES ELIMINADOS ===
  // addEnsayoPaes, updateEnsayoPaes, deleteEnsayoPaes eliminados
  // Los ensayos PAES fueron migrados al módulo informacion-admision/ensayo-paes

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.informacionAcademicaService.remove(id);
  }
}
