import { Controller, Get } from '@nestjs/common';
import { ComunaService } from './comuna.service';

@Controller('comuna')
export class ComunaController {
  constructor(private readonly comunaService: ComunaService) {}

  @Get()
  findAll() {
    return this.comunaService.findAll();
  }
}
