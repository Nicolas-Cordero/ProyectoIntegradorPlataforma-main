import { Module} from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { EstudianteController } from './estudiante.controller';
import { EstudianteRepository } from './estudiante.repository';

@Module({
  imports: [],
  controllers: [EstudianteController],
  providers: [
    EstudianteService,
    EstudianteRepository,
  ],
  exports: [EstudianteService],
})
export class EstudianteModule {}
