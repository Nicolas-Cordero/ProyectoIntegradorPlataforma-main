import { Injectable } from '@nestjs/common';
import { CreateRamoDto } from './dto/create-ramo.dto';
import { UpdateRamoDto } from './dto/update-ramo.dto';

@Injectable()
export class RamoService {
  create(createRamoDto: CreateRamoDto) {
    return 'This action adds a new ramo';
  }

  findAll() {
    return `This action returns all ramo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ramo`;
  }

  update(id: number, updateRamoDto: UpdateRamoDto) {
    return `This action updates a #${id} ramo`;
  }

  remove(id: number) {
    return `This action removes a #${id} ramo`;
  }
}
