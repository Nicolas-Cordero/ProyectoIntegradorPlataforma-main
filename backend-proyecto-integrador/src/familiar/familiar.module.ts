import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamiliarService } from './familiar.service';
import { FamiliarController } from './familiar.controller';
import { TipoFamiliar } from './entities/tipo-familiar.entity';
import { Familiar } from './entities/familiar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoFamiliar, Familiar])],
  controllers: [FamiliarController],
  providers: [FamiliarService],
  exports: [FamiliarService],
})
export class FamiliarModule {}
