import { Module } from '@nestjs/common';
import { ComunaService } from './comuna.service';
import { ComunaController } from './comuna.controller';
import { ComunaRepository } from './comuna.repository';

@Module({
  controllers: [ComunaController],
  providers: [ComunaService, ComunaRepository],
  exports: [ComunaRepository],
})
export class ComunaModule {}
