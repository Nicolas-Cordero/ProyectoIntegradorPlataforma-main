import { Module } from '@nestjs/common';
import { SemestreService } from './semestre.service';
import { SemestreController } from './semestre.controller';
import { SemestreRepository } from './semestre.repository';

@Module({
  controllers: [SemestreController],
  providers: [SemestreService, SemestreRepository],
})
export class SemestreModule {}
