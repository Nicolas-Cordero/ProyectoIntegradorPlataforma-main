import { BadRequestException } from '@nestjs/common';
import { SemestreRepository } from './semestre.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('SemestreRepository.cerrarSemestre', () => {
  let repo: SemestreRepository;
  let mockTx: {
    ramo: { findMany: jest.Mock; update: jest.Mock };
    semestre_carrera: { update: jest.Mock };
  };
  let mockPrisma: { $transaction: jest.Mock };

  beforeEach(() => {
    mockTx = {
      ramo: { findMany: jest.fn(), update: jest.fn() },
      semestre_carrera: { update: jest.fn() },
    };
    mockPrisma = {
      $transaction: jest.fn((cb: (tx: typeof mockTx) => unknown) => cb(mockTx)),
    };
    repo = new SemestreRepository(mockPrisma as unknown as PrismaService);
  });

  it('rechaza el cierre si algún ramo no eliminado no tiene nota final', async () => {
    mockTx.ramo.findMany.mockResolvedValue([
      { id: 1, estado: 'CURSANDO', nota_final: null },
    ]);

    await expect(repo.cerrarSemestre(1, 1)).rejects.toThrow(BadRequestException);
    expect(mockTx.ramo.update).not.toHaveBeenCalled();
    expect(mockTx.semestre_carrera.update).not.toHaveBeenCalled();
  });

  it('permite el cierre aunque un ramo eliminado no tenga nota final', async () => {
    mockTx.ramo.findMany.mockResolvedValue([
      { id: 1, estado: 'ELIMINADO', nota_final: null },
      { id: 2, estado: 'CURSANDO', nota_final: 5.5 },
    ]);

    await repo.cerrarSemestre(1, 1);

    expect(mockTx.ramo.update).toHaveBeenCalledTimes(1);
    expect(mockTx.ramo.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { estado: 'APROBADO' },
    });
    expect(mockTx.semestre_carrera.update).toHaveBeenCalledWith({
      where: { semestre_id_codigo_carrera: { semestre_id: 1, codigo_carrera: 1 } },
      data: { cerrado: true },
    });
  });

  it('calcula REPROBADO cuando la nota final es menor a 4', async () => {
    mockTx.ramo.findMany.mockResolvedValue([
      { id: 3, estado: 'CURSANDO', nota_final: 3.9 },
    ]);

    await repo.cerrarSemestre(2, 5);

    expect(mockTx.ramo.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { estado: 'REPROBADO' },
    });
  });

  it('no reescribe un ramo cuyo estado ya coincide con el calculado', async () => {
    mockTx.ramo.findMany.mockResolvedValue([
      { id: 4, estado: 'APROBADO', nota_final: 6.0 },
    ]);

    await repo.cerrarSemestre(2, 5);

    expect(mockTx.ramo.update).not.toHaveBeenCalled();
    expect(mockTx.semestre_carrera.update).toHaveBeenCalled();
  });

  it('el cierre nunca se dispara por el estado de los ramos: solo esta función lo marca', async () => {
    // Aunque todos los ramos ya estén en un estado terminal (como si un
    // estudiante los hubiese cambiado desde /ramo/me), semestre_carrera.cerrado
    // solo se toca cuando se invoca explícitamente cerrarSemestre.
    mockTx.ramo.findMany.mockResolvedValue([
      { id: 5, estado: 'APROBADO', nota_final: 6.0 },
      { id: 6, estado: 'REPROBADO', nota_final: 2.0 },
    ]);

    expect(mockTx.semestre_carrera.update).not.toHaveBeenCalled();
    await repo.cerrarSemestre(3, 7);
    expect(mockTx.semestre_carrera.update).toHaveBeenCalledTimes(1);
  });
});
