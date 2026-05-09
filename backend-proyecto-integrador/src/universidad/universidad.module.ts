import { Module } from '@nestjs/common';
import { UniversidadService } from './universidad.service';
import { UniversidadController } from './universidad.controller';

@Module({
  controllers: [UniversidadController],
  providers: [UniversidadService],
})
export class UniversidadModule {}
