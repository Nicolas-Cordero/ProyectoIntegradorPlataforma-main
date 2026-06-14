import { Test, TestingModule } from '@nestjs/testing';
import { PaesController } from './paes.controller';
import { PaesService } from './paes.service';

describe('PaesController', () => {
  let controller: PaesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaesController],
      providers: [PaesService],
    }).compile();

    controller = module.get<PaesController>(PaesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
