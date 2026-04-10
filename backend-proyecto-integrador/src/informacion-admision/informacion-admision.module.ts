import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InformacionAdmisionService } from './informacion-admision.service';
import { InformacionAdmisionController } from './informacion-admision.controller';
import { InformacionAdmision } from './entities/informacion-admision.entity';
import { EnsayoPaes } from './entities/ensayo-paes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InformacionAdmision, EnsayoPaes])],
  controllers: [InformacionAdmisionController],
  providers: [InformacionAdmisionService],
  exports: [InformacionAdmisionService],
})
export class InformacionAdmisionModule {}
