import { Test, TestingModule } from '@nestjs/testing';
import { AcuerdoController } from './acuerdo.controller';
import { AcuerdoService } from './acuerdo.service';

const mockAcuerdoService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findMostNear: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('AcuerdoController', () => {
  let controller: AcuerdoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcuerdoController],
      providers: [{ provide: AcuerdoService, useValue: mockAcuerdoService }],
    }).compile();

    controller = module.get<AcuerdoController>(AcuerdoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
