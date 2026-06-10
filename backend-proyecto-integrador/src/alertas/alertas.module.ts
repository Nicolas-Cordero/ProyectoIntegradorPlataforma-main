import { Module } from '@nestjs/common';
import { AlertasService } from './alertas.service';
import { AlertasController } from './alertas.controller';
import { AlertasRepository } from './alertas.repository';

@Module({
  controllers: [AlertasController],
  providers: [
    AlertasService, 
    AlertasRepository
  ],
})
export class AlertasModule {}
