import { EstadoRamo } from '@prisma/client';
import { SemestreRepository, RamoParaCierre } from './semestre.repository';
import { PrismaService } from '../prisma/prisma.service';

// El repositorio ya no decide estados: solo lee los ramos, aplica los cambios
// que el servicio calculó y marca el semestre como cerrado.
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

  it('entrega los ramos al cálculo con la nota ya normalizada a number', async () => {
    mockTx.ramo.findMany.mockResolvedValue([
      { id: 1, estado: EstadoRamo.CURSANDO, nota_final: '5.5' },
      { id: 2, estado: EstadoRamo.CURSANDO, nota_final: null },
    ]);
    let recibidos: RamoParaCierre[] = [];

    await repo.cerrarSemestre(1, 1, (ramos) => {
      recibidos = ramos;
      return [];
    });

    expect(recibidos).toEqual([
      { id: 1, estado: EstadoRamo.CURSANDO, nota_final: 5.5 },
      { id: 2, estado: EstadoRamo.CURSANDO, nota_final: null },
    ]);
  });

  it('aplica exactamente los cambios pedidos y marca el semestre cerrado', async () => {
    mockTx.ramo.findMany.mockResolvedValue([
      { id: 1, estado: EstadoRamo.CURSANDO, nota_final: null },
    ]);

    await repo.cerrarSemestre(2, 5, () => [
      { id: 1, estado: EstadoRamo.PENDIENTE },
    ]);

    expect(mockTx.ramo.update).toHaveBeenCalledTimes(1);
    expect(mockTx.ramo.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { estado: EstadoRamo.PENDIENTE },
    });
    expect(mockTx.semestre_carrera.update).toHaveBeenCalledWith({
      where: {
        semestre_id_codigo_carrera: { semestre_id: 2, codigo_carrera: 5 },
      },
      data: { cerrado: true },
    });
  });

  it('el cierre nunca se dispara por el estado de los ramos: solo esta función lo marca', async () => {
    // Aunque todos los ramos ya estén en un estado terminal (como si un
    // estudiante los hubiese cambiado desde /ramo/me), semestre_carrera.cerrado
    // solo se toca cuando se invoca explícitamente cerrarSemestre.
    mockTx.ramo.findMany.mockResolvedValue([
      { id: 5, estado: EstadoRamo.APROBADO, nota_final: 6 },
      { id: 6, estado: EstadoRamo.REPROBADO, nota_final: 2 },
    ]);

    expect(mockTx.semestre_carrera.update).not.toHaveBeenCalled();
    await repo.cerrarSemestre(3, 7, () => []);
    expect(mockTx.ramo.update).not.toHaveBeenCalled();
    expect(mockTx.semestre_carrera.update).toHaveBeenCalledTimes(1);
  });
});
