import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamiliaService } from './familia.service';
import { FamiliaController } from './familia.controller';
import { Familia } from './entities/familia.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Familia, Estudiante]),
  ],
  controllers: [FamiliaController],
  providers: [FamiliaService],
  exports: [FamiliaService],
})
export class FamiliaModule {}
