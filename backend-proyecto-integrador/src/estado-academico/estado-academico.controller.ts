import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { EstadoAcademicoService } from './estado-academico.service';
import { CreateEstadoAcademicoDto, UpdateEstadoAcademicoDto } from './dto';

@Controller('estado-academico')
export class EstadoAcademicoController {
  constructor(private readonly estadoAcademicoService: EstadoAcademicoService) {}

  @Post()
  create(@Body() createDto: CreateEstadoAcademicoDto) {
    return this.estadoAcademicoService.create(createDto);
  }

  @Get()
  findAll(@Query('status') status?: string, @Query('generacion') generacion?: string) {
    if (status) {
      return this.estadoAcademicoService.findByStatus(status);
    }
    if (generacion) {
      return this.estadoAcademicoService.findByGeneracion(generacion);
    }
    return this.estadoAcademicoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estadoAcademicoService.findOne(id);
  }

  @Get('estudiante/:estudianteId')
  findByEstudiante(@Param('estudianteId') estudianteId: string) {
    return this.estadoAcademicoService.findByEstudiante(estudianteId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEstadoAcademicoDto,
  ) {
    return this.estadoAcademicoService.update(id, updateDto);
  }

  @Put('estudiante/:estudianteId')
  upsertByEstudiante(
    @Param('estudianteId') estudianteId: string,
    @Body() updateDto: UpdateEstadoAcademicoDto,
  ) {
    return this.estadoAcademicoService.upsertByEstudiante(estudianteId, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estadoAcademicoService.remove(id);
  }
}
