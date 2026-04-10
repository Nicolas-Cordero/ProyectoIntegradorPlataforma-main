import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InformacionContactoService } from './informacion-contacto.service';
import { InformacionContactoController } from './informacion-contacto.controller';
import { InformacionContacto } from './entities/informacion-contacto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InformacionContacto])],
  controllers: [InformacionContactoController],
  providers: [InformacionContactoService],
  exports: [InformacionContactoService],
})
export class InformacionContactoModule {}
