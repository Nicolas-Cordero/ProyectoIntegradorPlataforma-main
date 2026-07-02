import { Module } from '@nestjs/common';
import { EntrevistasService } from './entrevistas.service';
import { EntrevistasController } from './entrevistas.controller';
import { AuthModule } from '../auth/auth.module';
import { EntrevistaRepository } from './entrevista.repository';

@Module({
  imports: [AuthModule],
  providers: [EntrevistasService, EntrevistaRepository],
  controllers: [EntrevistasController],
  exports: [EntrevistasService],
})
export class EntrevistasModule {}
