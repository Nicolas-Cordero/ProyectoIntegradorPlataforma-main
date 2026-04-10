import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { BeneficiosService } from './beneficios.service';
import {
  CreateBeneficioDto,
  UpdateBeneficioDto,
  CreateBeneficioEstudianteDto,
  UpdateBeneficioEstudianteDto,
} from './dto';

@Controller('beneficios')
export class BeneficiosController {
  constructor(private readonly beneficiosService: BeneficiosService) {}

  // === CATÁLOGO DE BENEFICIOS ===

  @Post('catalogo')
  createBeneficio(@Body() createDto: CreateBeneficioDto) {
    return this.beneficiosService.createBeneficio(createDto);
  }

  @Get('catalogo')
  findAllBeneficios() {
    return this.beneficiosService.findAllBeneficios();
  }

  @Get('catalogo/activos')
  findBeneficiosActivos() {
    return this.beneficiosService.findBeneficiosActivos();
  }

  @Get('catalogo/:id')
  findBeneficio(@Param('id') id: string) {
    return this.beneficiosService.findBeneficio(id);
  }

  @Patch('catalogo/:id')
  updateBeneficio(
    @Param('id') id: string,
    @Body() updateDto: UpdateBeneficioDto,
  ) {
    return this.beneficiosService.updateBeneficio(id, updateDto);
  }

  @Delete('catalogo/:id')
  removeBeneficio(@Param('id') id: string) {
    return this.beneficiosService.removeBeneficio(id);
  }

  // === BENEFICIOS POR ESTUDIANTE ===

  @Post()
  create(@Body() createDto: CreateBeneficioEstudianteDto) {
    return this.beneficiosService.create(createDto);
  }

  @Get()
  findAll() {
    return this.beneficiosService.findAll();
  }

  @Get('activos')
  findActivos() {
    return this.beneficiosService.findActivos();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.beneficiosService.findOne(id);
  }

  @Get('estudiante/:estudianteId')
  findByEstudiante(@Param('estudianteId') estudianteId: string) {
    return this.beneficiosService.findByEstudiante(estudianteId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBeneficioEstudianteDto,
  ) {
    return this.beneficiosService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.beneficiosService.remove(id);
  }
}
