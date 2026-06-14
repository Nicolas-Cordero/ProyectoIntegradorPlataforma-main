import { Module} from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { EstudianteController } from './estudiante.controller';
import { EstudianteRepository } from './estudiante.repository';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [EstudianteController],
  providers: [
    EstudianteService,
    EstudianteRepository,
  ],
  exports: [EstudianteService],
})
export class EstudianteModule {}
