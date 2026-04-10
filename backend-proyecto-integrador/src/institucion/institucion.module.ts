import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstitucionService } from './institucion.service';
import { InstitucionController } from './institucion.controller';
import { Institucion } from './entities/institucion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Institucion])],
  controllers: [InstitucionController],
  providers: [InstitucionService],
  exports: [InstitucionService],
})
export class InstitucionModule {}
