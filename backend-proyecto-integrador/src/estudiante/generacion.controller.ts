import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';


@Controller('generacion')
export class GeneracionController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @Get()
  findAllGenerations() {
    return this.estudianteService.findAllGenerations();
  }
}