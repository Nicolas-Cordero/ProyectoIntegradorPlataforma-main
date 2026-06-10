import { Module } from '@nestjs/common';
import { CarreraService } from './carrera.service';
import { CarreraController } from './carrera.controller';
import { CarreraRepository } from './carrera.repository';

@Module({
  controllers: [CarreraController],
  providers: [
    CarreraService,
    CarreraRepository,
  ],
})
export class CarreraModule {}
