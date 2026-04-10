import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PeriodoAcademicoService } from './periodo-academico.service';
import {
  CreatePeriodoAcademicoDto,
  UpdatePeriodoAcademicoDto,
  CreatePeriodoAcademicoEstudianteDto,
  UpdatePeriodoAcademicoEstudianteDto,
} from './dto';

@Controller('periodo-academico')
export class PeriodoAcademicoController {
  constructor(private readonly periodoAcademicoService: PeriodoAcademicoService) {}

  // === PERIODOS ACADÉMICOS ===

  @Post('periodos')
  createPeriodo(@Body() createDto: CreatePeriodoAcademicoDto) {
    return this.periodoAcademicoService.createPeriodo(createDto);
  }

  @Get('periodos')
  findAllPeriodos() {
    return this.periodoAcademicoService.findAllPeriodos();
  }

  @Get('periodos/actual')
  findPeriodoActual() {
    return this.periodoAcademicoService.findPeriodoActual();
  }

  @Get('periodos/buscar')
  findByAñoSemestre(
    @Query('año') año: string,
    @Query('semestre') semestre: string,
  ) {
    return this.periodoAcademicoService.findByAñoSemestre(año, semestre);
  }

  @Get('periodos/:id')
  findPeriodo(@Param('id') id: string) {
    return this.periodoAcademicoService.findPeriodo(id);
  }

  @Patch('periodos/:id')
  updatePeriodo(
    @Param('id') id: string,
    @Body() updateDto: UpdatePeriodoAcademicoDto,
  ) {
    return this.periodoAcademicoService.updatePeriodo(id, updateDto);
  }

  @Delete('periodos/:id')
  removePeriodo(@Param('id') id: string) {
    return this.periodoAcademicoService.removePeriodo(id);
  }

  // === PERIODOS POR ESTUDIANTE ===

  @Post()
  create(@Body() createDto: CreatePeriodoAcademicoEstudianteDto) {
    return this.periodoAcademicoService.create(createDto);
  }

  @Get()
  findAll() {
    return this.periodoAcademicoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.periodoAcademicoService.findOne(id);
  }

  @Get('estudiante/:estudianteId')
  findByEstudiante(@Param('estudianteId') estudianteId: string) {
    return this.periodoAcademicoService.findByEstudiante(estudianteId);
  }

  @Get('periodo/:periodoId')
  findByPeriodo(@Param('periodoId') periodoId: string) {
    return this.periodoAcademicoService.findByPeriodo(periodoId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePeriodoAcademicoEstudianteDto,
  ) {
    return this.periodoAcademicoService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.periodoAcademicoService.remove(id);
  }
}
