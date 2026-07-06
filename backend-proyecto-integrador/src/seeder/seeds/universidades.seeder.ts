import { prisma } from '../prisma-client';

import { universidadesData } from '../data/';

export async function universidadesSeeder() {
  for (const universidad of universidadesData) {
    await prisma.universidad.upsert({
      where: {
        nombre_comuna: {
          nombre: universidad.nombre,
          comuna: universidad.comuna,
        },
      },
      update: {},
      create: {
        nombre: universidad.nombre,
        comuna: universidad.comuna,
      },
    });
  }

  console.log('Universidades seeded successfully');
}
