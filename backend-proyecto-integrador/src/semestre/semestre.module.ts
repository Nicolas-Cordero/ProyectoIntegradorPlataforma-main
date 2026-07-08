import { Module } from '@nestjs/common';
import { SemestreService } from './semestre.service';
import { SemestreController } from './semestre.controller';
import { SemestreRepository } from './semestre.repository';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [SemestreController],
  providers: [SemestreService, SemestreRepository],
})
export class SemestreModule {}
