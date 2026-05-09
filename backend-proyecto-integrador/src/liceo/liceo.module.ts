import { Module } from '@nestjs/common';
import { LiceoService } from './liceo.service';
import { LiceoController } from './liceo.controller';

@Module({
  controllers: [LiceoController],
  providers: [LiceoService],
})
export class LiceoModule {}
