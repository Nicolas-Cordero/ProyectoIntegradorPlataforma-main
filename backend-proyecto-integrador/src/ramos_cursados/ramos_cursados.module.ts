import { Module } from '@nestjs/common';
import { RamosCursadosService } from './ramos_cursados.service';
import { RamosCursadosController } from './ramos_cursados.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RamosCursados } from './entities/ramos_cursado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RamosCursados])],
  controllers: [RamosCursadosController],
  providers: [RamosCursadosService],
  exports: [RamosCursadosService],
})
export class RamosCursadosModule {}
