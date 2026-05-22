import { Module, forwardRef } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { EstudianteController } from './estudiante.controller';
import { EntrevistasModule } from '../entrevistas/entrevistas.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    forwardRef(() => EntrevistasModule),
  ],
  controllers: [EstudianteController],
  providers: [
    EstudianteService,
    PrismaService,
  ],
  exports: [EstudianteService],
})
export class EstudianteModule {}
