import { Module } from '@nestjs/common';
import { GeneracionesController } from './generaciones.controller';
import { GeneracionesService } from './generaciones.service';
import { GeneracionesRepository } from './generaciones.repository';

@Module({
  controllers: [GeneracionesController],
  providers: [GeneracionesService, GeneracionesRepository],
  exports: [GeneracionesService],
})
export class GeneracionesModule {}
