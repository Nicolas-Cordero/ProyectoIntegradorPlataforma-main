import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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

  @Get()
  findAll() {
    return this.ramoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ramoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRamoDto: UpdateRamoDto) {
    return this.ramoService.update(+id, updateRamoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ramoService.remove(+id);
  }
}
