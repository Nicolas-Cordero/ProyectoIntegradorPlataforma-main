import { Test, TestingModule } from '@nestjs/testing';
import { PaesController } from './paes.controller';
import { PaesService } from './paes.service';

// Un test de controlador aísla al controlador: se mockea su dependencia directa
// (PaesService) en lugar de instanciar la cadena real service → repository → prisma.
const mockPaesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByEstudiante: jest.fn(),
  getByGeneration: jest.fn(),
  update: jest.fn(),
  removeByEstudiante: jest.fn(),
};

describe('PaesController', () => {
  let controller: PaesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaesController],
      providers: [{ provide: PaesService, useValue: mockPaesService }],
    }).compile();

    controller = module.get<PaesController>(PaesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
