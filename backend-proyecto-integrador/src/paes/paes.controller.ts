import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaesService } from './paes.service';
import { CreatePaesDto } from './dto/create-paes.dto';
import { UpdatePaesDto } from './dto/update-paes.dto';

@Controller('paes')
export class PaesController {
  constructor(private readonly paesService: PaesService) {}

  @Post()
  create(@Body() createPaesDto: CreatePaesDto) {
    return this.paesService.create(createPaesDto);
  }

  @Get()
  findAll() {
    return this.paesService.findAll();
  }

  @Get('estudiante/:rut')
  findByEstudiante(@Param('rut') rut: string) {
    return this.paesService.findByEstudiante(rut);
  }

  @Get('generacion/:generacion')
  getByGeneration(@Param('generacion') generacion: string) {
    return this.paesService.getByGeneration(generacion);
  }

  @Patch(':rut')
  update(@Param('rut') rut: string, @Body() updatePaesDto: UpdatePaesDto) {
    return this.paesService.update(rut, updatePaesDto);
  }

  @Delete(':rut')
  removeByEstudiante(@Param('rut') rut: string) {
    return this.paesService.removeByEstudiante(rut);
  }
}
