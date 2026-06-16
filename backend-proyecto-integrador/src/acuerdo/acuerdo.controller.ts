import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AcuerdoService } from './acuerdo.service';
import { CreateAcuerdoDto } from './dto/create-acuerdo.dto';
import { UpdateAcuerdoDto } from './dto/update-acuerdo.dto';

@Controller('acuerdo')
export class AcuerdoController {
  constructor(private readonly acuerdoService: AcuerdoService) {}

  @Post()
  create(@Body() createAcuerdoDto: CreateAcuerdoDto) {
    return this.acuerdoService.create(createAcuerdoDto);
  }

  @Get()
  findAll() {
    return this.acuerdoService.findAll();
  }

  @Get('vigente')
  findVigente(@Query('fecha') fecha?: string) {
    const fechaObjetivo = fecha ? new Date(fecha) : new Date();
    if (Number.isNaN(fechaObjetivo.getTime())) {
      throw new BadRequestException(`La fecha "${fecha}" no es válida`);
    }
    return this.acuerdoService.findMostNear(fechaObjetivo);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAcuerdoDto: UpdateAcuerdoDto) {
    return this.acuerdoService.update(+id, updateAcuerdoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.acuerdoService.remove(+id);
  }
}
