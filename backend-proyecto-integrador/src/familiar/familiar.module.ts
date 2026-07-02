import { Module } from '@nestjs/common';
import { FamiliarService } from './familiar.service';
import { FamiliarController } from './familiar.controller';
import { FamiliarRepository } from './familiar.repository';

@Module({
  imports: [],
  controllers: [FamiliarController],
  providers: [FamiliarService, FamiliarRepository],
  exports: [FamiliarService],
})
export class FamiliarModule {}
