import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoAcademicoService } from './estado-academico.service';
import { EstadoAcademicoController } from './estado-academico.controller';
import { EstadoAcademico } from './entities/estado-academico.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoAcademico])],
  controllers: [EstadoAcademicoController],
  providers: [EstadoAcademicoService],
  exports: [EstadoAcademicoService],
})
export class EstadoAcademicoModule {}
