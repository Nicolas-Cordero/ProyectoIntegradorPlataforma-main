import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UniversidadRepository } from './universidad.repository';
import {
  UniversidadService,
  normalizarNombreInstitucion,
} from './universidad.service';

const mockRepository = {
  create: jest.fn(),
  update: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByComuna: jest.fn(),
  findByEstudiante: jest.fn(),
};

const LA_SERENA = { codigo_comuna: 4101, nombre: 'La Serena', region: 'Coquimbo' };

const inacapLaSerena = {
  codigo_universidad: 10,
  nombre: 'INACAP',
  codigo_comuna: 4101,
  comuna: LA_SERENA,
};

describe('normalizarNombreInstitucion', () => {
  it('Debe ignorar mayúsculas, tildes, signos y espacios', () => {
    expect(normalizarNombreInstitucion('I.N.A.C.A.P.')).toBe('inacap');
    expect(normalizarNombreInstitucion('  Inacap ')).toBe('inacap');
    expect(normalizarNombreInstitucion('Universidad Católica del Norte')).toBe(
      normalizarNombreInstitucion('universidad  catolica del norte'),
    );
  });
});

describe('UniversidadService', () => {
  let service: UniversidadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniversidadService,
        { provide: UniversidadRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UniversidadService>(UniversidadService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('Debe crear la institución con el nombre sin espacios sobrantes', async () => {
      mockRepository.findByComuna.mockResolvedValue([]);
      mockRepository.create.mockResolvedValue(inacapLaSerena);

      await service.create({ nombre: '  CFT   Estatal ', codigo_comuna: 4101 });

      expect(mockRepository.create).toHaveBeenCalledWith({
        nombre: 'CFT Estatal',
        codigo_comuna: 4101,
      });
    });

    it('Debe rechazar una variante del nombre ya existente en la misma comuna', async () => {
      mockRepository.findByComuna.mockResolvedValue([inacapLaSerena]);

      await expect(
        service.create({ nombre: 'Inacap', codigo_comuna: 4101 }),
      ).rejects.toThrow(ConflictException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('Debe permitir la misma institución en otra comuna (otra sede)', async () => {
      // findByComuna filtra por comuna: en Coquimbo no hay ningún INACAP.
      mockRepository.findByComuna.mockResolvedValue([]);
      mockRepository.create.mockResolvedValue({ ...inacapLaSerena, codigo_comuna: 4102 });

      await service.create({ nombre: 'INACAP', codigo_comuna: 4102 });

      expect(mockRepository.findByComuna).toHaveBeenCalledWith(4102);
      expect(mockRepository.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('Debe permitir guardar la institución sin cambiar su propio nombre', async () => {
      mockRepository.findOne.mockResolvedValue(inacapLaSerena);
      mockRepository.findByComuna.mockResolvedValue([inacapLaSerena]);
      mockRepository.update.mockResolvedValue(inacapLaSerena);

      await service.update(10, { nombre: 'INACAP' });

      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('Debe rechazar moverla a una comuna donde ya existe con ese nombre', async () => {
      mockRepository.findOne.mockResolvedValue({ ...inacapLaSerena, codigo_universidad: 11, codigo_comuna: 4102 });
      mockRepository.findByComuna.mockResolvedValue([inacapLaSerena]);

      await expect(service.update(11, { codigo_comuna: 4101 })).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });
});
