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
import { InformacionAdmisionService } from './informacion-admision.service';
import {
  CreateInformacionAdmisionDto,
  UpdateInformacionAdmisionDto,
  CreateEnsayoPaesDto,
  UpdateEnsayoPaesDto,
} from './dto';

@Controller('informacion-admision')
export class InformacionAdmisionController {
  constructor(private readonly admisionService: InformacionAdmisionService) {}

  // === INFORMACIÓN DE ADMISIÓN ===

  @Post()
  create(@Body() createDto: CreateInformacionAdmisionDto) {
    return this.admisionService.create(createDto);
  }

  @Get()
  findAll() {
    return this.admisionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.admisionService.findOne(id);
  }

  @Get('estudiante/:estudianteId')
  findByEstudiante(@Param('estudianteId') estudianteId: string) {
    return this.admisionService.findByEstudiante(estudianteId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateInformacionAdmisionDto,
  ) {
    return this.admisionService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.admisionService.remove(id);
  }

  // === ENSAYOS PAES ===

  @Post('ensayos')
  createEnsayo(@Body() createDto: CreateEnsayoPaesDto) {
    return this.admisionService.createEnsayo(createDto);
  }

  @Get('ensayos/all')
  findAllEnsayos() {
    return this.admisionService.findAllEnsayos();
  }

  @Get('ensayos/:id')
  findEnsayo(@Param('id') id: string) {
    return this.admisionService.findEnsayo(id);
  }

  @Get('ensayos/estudiante/:estudianteId')
  findEnsayosByEstudiante(@Param('estudianteId') estudianteId: string) {
    return this.admisionService.findEnsayosByEstudiante(estudianteId);
  }

  @Patch('ensayos/:id')
  updateEnsayo(
    @Param('id') id: string,
    @Body() updateDto: UpdateEnsayoPaesDto,
  ) {
    return this.admisionService.updateEnsayo(id, updateDto);
  }

  @Delete('ensayos/:id')
  removeEnsayo(@Param('id') id: string) {
    return this.admisionService.removeEnsayo(id);
  }
}
