import { Module } from '@nestjs/common';
import { ComentarioService } from './comentario.service';
import { ComentarioController } from './comentario.controller';
import { ComentarioRepository } from './comentario.repository';

@Module({
  controllers: [ComentarioController],
  providers: [
    ComentarioService,
    ComentarioRepository
  ],
})
export class ComentarioModule {}
