import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TipoSemestre, Topico } from '@prisma/client';
import { EntrevistasService } from './entrevistas.service';
import { EntrevistaRepository } from './entrevista.repository';
import { PrismaService } from '../prisma/prisma.service';

const mockRepo = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByEstudiante: jest.fn(),
};

const mockPrisma = {
  semestre: {
    upsert: jest.fn(),
  },
};

const makeSemestre = (id: number, year: number, semestre: string) => ({
  semestre_id: id,
  year,
  semestre,
  tipo: TipoSemestre.REGULAR,
});

describe('EntrevistasService', () => {
  let service: EntrevistasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntrevistasService,
        { provide: EntrevistaRepository, useValue: mockRepo },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EntrevistasService>(EntrevistasService);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  // ── resolveSemestreId (casos límite) ───────────────────────────────────────

  describe('resolveSemestreId', () => {
    it('1 de enero debe resolverse como PRIMER_SEMESTRE', async () => {
      // Arrange
      mockPrisma.semestre.upsert.mockResolvedValue(
        makeSemestre(1, 2026, 'PRIMER_SEMESTRE'),
      );

      // Act
      const id = await service.resolveSemestreId(new Date(2026, 0, 1));

      // Assert
      expect(mockPrisma.semestre.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { year_semestre: { year: 2026, semestre: 'PRIMER_SEMESTRE' } },
          create: expect.objectContaining({
            tipo: TipoSemestre.REGULAR,
            semestre: 'PRIMER_SEMESTRE',
          }),
        }),
      );
      expect(id).toBe(1);
    });

    it('30 de junio debe resolverse como PRIMER_SEMESTRE', async () => {
      // Arrange
      mockPrisma.semestre.upsert.mockResolvedValue(
        makeSemestre(2, 2026, 'PRIMER_SEMESTRE'),
      );

      // Act
      const id = await service.resolveSemestreId(new Date(2026, 5, 30));

      // Assert
      expect(mockPrisma.semestre.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { year_semestre: { year: 2026, semestre: 'PRIMER_SEMESTRE' } },
        }),
      );
      expect(id).toBe(2);
    });

    it('1 de julio debe resolverse como SEGUNDO_SEMESTRE', async () => {
      // Arrange
      mockPrisma.semestre.upsert.mockResolvedValue(
        makeSemestre(3, 2026, 'SEGUNDO_SEMESTRE'),
      );

      // Act
      const id = await service.resolveSemestreId(new Date(2026, 6, 1));

      // Assert
      expect(mockPrisma.semestre.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            year_semestre: { year: 2026, semestre: 'SEGUNDO_SEMESTRE' },
          },
          create: expect.objectContaining({
            tipo: TipoSemestre.REGULAR,
            semestre: 'SEGUNDO_SEMESTRE',
          }),
        }),
      );
      expect(id).toBe(3);
    });

    it('31 de diciembre debe resolverse como SEGUNDO_SEMESTRE', async () => {
      // Arrange
      mockPrisma.semestre.upsert.mockResolvedValue(
        makeSemestre(4, 2026, 'SEGUNDO_SEMESTRE'),
      );

      // Act
      const id = await service.resolveSemestreId(new Date(2026, 11, 31));

      // Assert
      expect(mockPrisma.semestre.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            year_semestre: { year: 2026, semestre: 'SEGUNDO_SEMESTRE' },
          },
        }),
      );
      expect(id).toBe(4);
    });

    it('si el semestre no existe, upsert lo crea con tipo REGULAR', async () => {
      // Arrange — upsert devuelve el recién creado
      mockPrisma.semestre.upsert.mockResolvedValue(
        makeSemestre(99, 2099, 'PRIMER_SEMESTRE'),
      );

      // Act
      const id = await service.resolveSemestreId(new Date(2099, 2, 15));

      // Assert
      expect(mockPrisma.semestre.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: {
            year: 2099,
            semestre: 'PRIMER_SEMESTRE',
            tipo: TipoSemestre.REGULAR,
          },
        }),
      );
      expect(id).toBe(99);
    });
  });

  // ── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('usa la fecha_hora recibida y calcula el semestre_id correspondiente', async () => {
      // Arrange
      const fecha = new Date(2026, 2, 10); // marzo → PRIMER_SEMESTRE
      mockPrisma.semestre.upsert.mockResolvedValue(
        makeSemestre(5, 2026, 'PRIMER_SEMESTRE'),
      );
      mockRepo.create.mockResolvedValue({
        id: 1,
        rut_estudiante: '12345678-9',
      });

      // Act
      await service.create(
        { rut_estudiante: '12345678-9', duracion_s: 3600, fecha_hora: fecha },
        '98765432-1',
      );

      // Assert
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fecha_hora: fecha,
          semestre_id: 5,
          rut_entrevistador: '98765432-1',
          comentarios: [],
        }),
      );
    });

    it('usa new Date() como fecha si no se envía fecha_hora', async () => {
      // Arrange
      const ahora = new Date(2026, 8, 1); // septiembre → SEGUNDO_SEMESTRE
      jest.useFakeTimers();
      jest.setSystemTime(ahora);

      mockPrisma.semestre.upsert.mockResolvedValue(
        makeSemestre(6, 2026, 'SEGUNDO_SEMESTRE'),
      );
      mockRepo.create.mockResolvedValue({
        id: 2,
        rut_estudiante: '12345678-9',
      });

      // Act
      await service.create(
        { rut_estudiante: '12345678-9', duracion_s: 1800 },
        '98765432-1',
      );

      // Assert
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fecha_hora: ahora,
          semestre_id: 6,
        }),
      );
    });

    it('crea comentarios anidados cuando se envían', async () => {
      // Arrange
      mockPrisma.semestre.upsert.mockResolvedValue(
        makeSemestre(5, 2026, 'PRIMER_SEMESTRE'),
      );
      mockRepo.create.mockResolvedValue({ id: 3 });

      const comentarios = [
        { topico: Topico.GENERAL, texto: 'Comentario general' },
        { topico: Topico.ACADEMICO, texto: 'Comentario académico' },
      ];

      // Act
      await service.create(
        { rut_estudiante: '12345678-9', duracion_s: 1200, comentarios },
        '98765432-1',
      );

      // Assert
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ comentarios }),
      );
    });

    it('crea sin comentarios si el arreglo viene vacío', async () => {
      // Arrange
      mockPrisma.semestre.upsert.mockResolvedValue(
        makeSemestre(5, 2026, 'PRIMER_SEMESTRE'),
      );
      mockRepo.create.mockResolvedValue({ id: 4 });

      // Act
      await service.create(
        { rut_estudiante: '12345678-9', duracion_s: 900, comentarios: [] },
        '98765432-1',
      );

      // Assert
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ comentarios: [] }),
      );
    });
  });

  // ── updateEntrevista ───────────────────────────────────────────────────────

  describe('updateEntrevista', () => {
    it('recalcula semestre_id cuando se actualiza fecha_hora', async () => {
      // Arrange
      const nuevaFecha = new Date(2026, 9, 1); // octubre → SEGUNDO_SEMESTRE
      mockPrisma.semestre.upsert.mockResolvedValue(
        makeSemestre(7, 2026, 'SEGUNDO_SEMESTRE'),
      );
      mockRepo.update.mockResolvedValue({ id: 1 });

      // Act
      await service.updateEntrevista(1, { fecha_hora: nuevaFecha });

      // Assert
      expect(mockPrisma.semestre.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            year_semestre: { year: 2026, semestre: 'SEGUNDO_SEMESTRE' },
          },
        }),
      );
      expect(mockRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ semestre_id: 7 }),
      );
    });

    it('no recalcula semestre_id si fecha_hora no cambia', async () => {
      // Arrange
      mockRepo.update.mockResolvedValue({ id: 1 });

      // Act
      await service.updateEntrevista(1, { duracion_s: 7200 });

      // Assert
      expect(mockPrisma.semestre.upsert).not.toHaveBeenCalled();
      expect(mockRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ semestre_id: undefined }),
      );
    });

    it('cambia el semestre al cruzar el límite de julio al editar fecha_hora', async () => {
      // Arrange — entrevista originalmente en junio (PRIMER) → se mueve a julio (SEGUNDO)
      const fechaJulio = new Date(2026, 6, 15);
      mockPrisma.semestre.upsert.mockResolvedValue(
        makeSemestre(8, 2026, 'SEGUNDO_SEMESTRE'),
      );
      mockRepo.update.mockResolvedValue({ id: 1 });

      // Act
      await service.updateEntrevista(1, { fecha_hora: fechaJulio });

      // Assert
      expect(mockRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ semestre_id: 8 }),
      );
    });
  });

  // ── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('lanza BadRequestException si la entrevista no existe', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(BadRequestException);
    });
  });
});
