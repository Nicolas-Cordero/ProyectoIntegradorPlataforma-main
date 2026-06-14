import { Module } from '@nestjs/common';
import { PaesService } from './paes.service';
import { PaesController } from './paes.controller';
import { PaesRepository } from './paes.repository';

@Module({
  controllers: [PaesController],
  providers: [PaesService, PaesRepository],
  exports: [PaesService],
})
export class PaesModule {}
