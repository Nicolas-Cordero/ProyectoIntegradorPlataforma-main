import { Module } from '@nestjs/common';
import { EntrevistasService } from './entrevistas.service';
import { EntrevistasController } from './entrevistas.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    AuthModule,
  ],
  providers: [
    EntrevistasService,
    PrismaService
  ],
  controllers: [EntrevistasController],
  exports: [EntrevistasService],
})
export class EntrevistasModule {}
