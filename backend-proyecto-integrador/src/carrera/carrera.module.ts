import { Module } from '@nestjs/common';
import { CarreraService } from './carrera.service';
import { CarreraController } from './carrera.controller';
import { CarreraRepository } from './carrera.repository';
import { HistorialEstadoCarreraModule } from '../historial-estado-carrera';

@Module({
  imports: [HistorialEstadoCarreraModule],
  controllers: [CarreraController],
  providers: [CarreraService, CarreraRepository],
})
export class CarreraModule {}
