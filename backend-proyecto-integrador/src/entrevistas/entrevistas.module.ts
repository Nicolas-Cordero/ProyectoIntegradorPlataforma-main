import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entrevista } from './entities/entrevista.entity';
import { Etiqueta } from './entities/etiqueta.entity';
import { Texto } from './entities/texto.entity';
import { EntrevistasService } from './entrevistas.service';
import { EntrevistasController } from './entrevistas.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Entrevista, Etiqueta, Texto]),
    AuthModule,
  ],
  providers: [EntrevistasService],
  controllers: [EntrevistasController],
  exports: [EntrevistasService],
})
export class EntrevistasModule {}
