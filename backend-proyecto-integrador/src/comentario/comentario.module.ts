import { Module } from '@nestjs/common';
import { ComentarioService } from './comentario.service';
import { ComentarioController } from './comentario.controller';
import { ComentarioRepository } from './comentario.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ComentarioController],
  providers: [ComentarioService, ComentarioRepository],
})
export class ComentarioModule {}
