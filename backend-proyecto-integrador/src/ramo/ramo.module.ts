import { Module } from '@nestjs/common';
import { RamoService } from './ramo.service';
import { RamoController } from './ramo.controller';

@Module({
  controllers: [RamoController],
  providers: [RamoService],
})
export class RamoModule {}
