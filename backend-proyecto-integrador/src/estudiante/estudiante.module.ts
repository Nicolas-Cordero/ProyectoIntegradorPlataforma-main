import { Module} from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { EstudianteController } from './estudiante.controller';
import { EstudianteRepository } from './estudiante.repository';
import { GeneracionController } from './generacion.controller';

@Module({
  imports: [],
  controllers: [EstudianteController, GeneracionController],
  providers: [
    EstudianteService,
    EstudianteRepository,
  ],
  exports: [EstudianteService],
})
export class EstudianteModule {}
