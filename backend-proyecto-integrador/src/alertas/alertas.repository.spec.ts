import { EstadoRamo } from '@prisma/client';
import { AlertasRepository } from './alertas.repository';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  estudiante: { findMany: jest.fn() },
  entrevista: { groupBy: jest.fn() },
  ramo: { findMany: jest.fn() },
  firma_acuerdo: { findMany: jest.fn() },
};

describe('AlertasRepository', () => {
  const repo = new AlertasRepository(mockPrisma as unknown as PrismaService);
  const ruts = ['12345678-9', '98765432-1'];

  afterEach(() => jest.resetAllMocks());

  it('filtra los estudiantes por generación en la consulta', async () => {
    mockPrisma.estudiante.findMany.mockResolvedValue([
      { rut_estudiante: '12345678-9' },
    ]);

    expect(await repo.findRutsEstudiantes(2020)).toEqual(['12345678-9']);
    expect(mockPrisma.estudiante.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { generacion_rel: { año: 2020 } } }),
    );
  });

  it('trae todos los estudiantes si no se indica generación', async () => {
    mockPrisma.estudiante.findMany.mockResolvedValue([]);

    await repo.findRutsEstudiantes();

    expect(mockPrisma.estudiante.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });

  it('agrupa las entrevistas por estudiante y toma la fecha máxima', async () => {
    const fecha = new Date('2026-10-01');
    mockPrisma.entrevista.groupBy.mockResolvedValue([
      { rut_estudiante: '12345678-9', _max: { fecha_hora: fecha } },
    ]);

    const ultimas = await repo.getUltimaEntrevistaPorEstudiante(ruts);

    expect(mockPrisma.entrevista.groupBy).toHaveBeenCalledWith({
      by: ['rut_estudiante'],
      where: { rut_estudiante: { in: ruts } },
      _max: { fecha_hora: true },
    });
    expect(ultimas).toEqual(new Map([['12345678-9', fecha]]));
  });

  it('trae solo ramos CURSANDO o PENDIENTE sin nota final, con su semestre', async () => {
    mockPrisma.ramo.findMany.mockResolvedValue([]);

    await repo.getRamosSinNota(ruts);

    expect(mockPrisma.ramo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          rut_estudiante: { in: ruts },
          estado: { in: [EstadoRamo.CURSANDO, EstadoRamo.PENDIENTE] },
          nota_final: null,
        },
        select: expect.objectContaining({
          semestre: { select: { year: true, semestre: true } },
        }),
      }),
    );
  });

  it('consulta las firmas del acuerdo solo de los estudiantes indicados', async () => {
    mockPrisma.firma_acuerdo.findMany.mockResolvedValue([
      { rut_estudiante: '12345678-9' },
    ]);

    expect(await repo.getRutsConFirma(3, ruts)).toEqual(['12345678-9']);
    expect(mockPrisma.firma_acuerdo.findMany).toHaveBeenCalledWith({
      where: { acuerdo_id: 3, rut_estudiante: { in: ruts } },
      select: { rut_estudiante: true },
    });
  });
});
