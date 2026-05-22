import { Module } from '@nestjs/common';
import { FamiliarService } from './familiar.service';
import { FamiliarController } from './familiar.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [FamiliarController],
  providers: [
    FamiliarService,
    PrismaService
  ],
  exports: [FamiliarService],
})
export class FamiliarModule {}
