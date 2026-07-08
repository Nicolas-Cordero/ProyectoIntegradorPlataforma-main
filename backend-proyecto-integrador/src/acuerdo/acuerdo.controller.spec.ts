import { Test, TestingModule } from '@nestjs/testing';
import { AcuerdoController } from './acuerdo.controller';
import { AcuerdoService } from './acuerdo.service';

const mockAcuerdoService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findMostNear: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getFirmantes: jest.fn(),
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

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Debe delegar getFirmantes al servicio con el id numérico', async () => {
    const firmantes = [
      { rut_estudiante: '12345678-9', nombre: 'Camila', apellido: 'Rojas', firmadoAt: new Date('2026-06-16') },
    ];
    mockAcuerdoService.getFirmantes.mockResolvedValue(firmantes);

    const response = await controller.getFirmantes('1');

    expect(mockAcuerdoService.getFirmantes).toHaveBeenCalledWith(1);
    expect(response).toEqual(firmantes);
  });
});
