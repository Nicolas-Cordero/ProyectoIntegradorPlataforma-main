import { Module } from '@nestjs/common';
import { RamoService } from './ramo.service';
import { RamoController } from './ramo.controller';
import { RamoRepository } from './ramo.repository';

@Module({
  controllers: [RamoController],
  providers: [
    RamoService,
    RamoRepository,
  ],
})
export class RamoModule {}
