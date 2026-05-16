import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { RamoService } from './ramo.service';
import { CreateRamoDto } from './dto/create-ramo.dto';
import { UpdateRamoDto } from './dto/update-ramo.dto';

@Controller('ramo')
export class RamoController {
  constructor(private readonly ramoService: RamoService) {}

  @Post()
  create(@Body() createRamoDto: CreateRamoDto) {
    return this.ramoService.create(createRamoDto);
  }

  @Get(':id_ramo')
  findOne(@Param('id_ramo', ParseIntPipe) id_ramo: number) {
    return this.ramoService.findOne(id_ramo);
  }

  @Get(':id_ramo/nota-final')
  getNotaFinal(@Param('id_ramo', ParseIntPipe) id_ramo: number) {
    return this.ramoService.getNotaFinal(id_ramo);
  }

  @Get(':id_ramo/nota-final')
  getNotas(@Param('id_ramo', ParseIntPipe) id_ramo: number) {
    return this.ramoService.getNotas(id_ramo);
  }

  @Patch(':id_ramo')
  update(@Param('id_ramo', ParseIntPipe) id_ramo: number, @Body() updateRamoDto: UpdateRamoDto) {
    return this.ramoService.update(id_ramo, updateRamoDto);
  }

  @Delete(':id_ramo')
  remove(@Param('id_ramo', ParseIntPipe) id_ramo: number) {
    return this.ramoService.remove(id_ramo);
  }
}
