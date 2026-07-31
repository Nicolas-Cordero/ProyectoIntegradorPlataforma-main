import { Module } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { EstudianteController } from './estudiante.controller';
import { EstudianteRepository } from './estudiante.repository';
import { StorageModule } from '../storage/storage.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [StorageModule, UsersModule],
  controllers: [EstudianteController],
  providers: [EstudianteService, EstudianteRepository],
  exports: [EstudianteService],
})
export class EstudianteModule {}
