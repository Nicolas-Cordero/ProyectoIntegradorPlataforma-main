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
} from '@nestjs/common';
import { InformacionContactoService } from './informacion-contacto.service';
import { CreateInformacionContactoDto, UpdateInformacionContactoDto } from './dto';

@Controller('informacion-contacto')
export class InformacionContactoController {
  constructor(private readonly informacionContactoService: InformacionContactoService) {}

  @Post()
  create(@Body() createDto: CreateInformacionContactoDto) {
    return this.informacionContactoService.create(createDto);
  }

  @Get()
  findAll() {
    return this.informacionContactoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.informacionContactoService.findOne(id);
  }

  @Get('estudiante/:estudianteId')
  findByEstudiante(@Param('estudianteId') estudianteId: string) {
    return this.informacionContactoService.findByEstudiante(estudianteId);
  }

  @Put('estudiante/:estudianteId')
  upsertByEstudiante(
    @Param('estudianteId') estudianteId: string,
    @Body() updateDto: UpdateInformacionContactoDto,
  ) {
    return this.informacionContactoService.upsertByEstudiante(estudianteId, updateDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateInformacionContactoDto,
  ) {
    return this.informacionContactoService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.informacionContactoService.remove(id);
  }
}
