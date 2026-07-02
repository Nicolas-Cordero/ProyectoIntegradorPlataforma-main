import { Module } from '@nestjs/common';
import { LiceoService } from './liceo.service';
import { LiceoController } from './liceo.controller';
import { LiceoRepository } from './liceo.repository';

@Module({
  controllers: [LiceoController],
  providers: [LiceoService, LiceoRepository],
})
export class LiceoModule {}
