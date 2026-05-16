import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LiceoService } from './liceo.service';
import { CreateLiceoDto } from './dto/create-liceo.dto';
import { UpdateLiceoDto } from './dto/update-liceo.dto';

@Controller('liceo')
export class LiceoController {
  constructor(private readonly liceoService: LiceoService) {}

  @Post()
  create(@Body() createLiceoDto: CreateLiceoDto) {
    return this.liceoService.create(createLiceoDto);
  }

  @Get()
  findAll() {
    return this.liceoService.findAll();
  }

  @Get(':rbd_liceo')
  findOne(@Param('rbd_liceo') rbd_liceo: string) {
    return this.liceoService.findOne(rbd_liceo);
  }

  @Patch(':rbd_liceo')
  update(@Param('rbd_liceo') rbd_liceo: string, @Body() updateLiceoDto: UpdateLiceoDto) {
    return this.liceoService.update(rbd_liceo, updateLiceoDto);
  }

  @Delete(':rbd_liceo')
  remove(@Param('rbd_liceo') rbd_liceo: string) {
    return this.liceoService.remove(rbd_liceo);
  }
}
