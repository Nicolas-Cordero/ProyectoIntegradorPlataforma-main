import { PrismaClient } from '@prisma/client';

import { universidadesData } from '../data/';

const prisma = new PrismaClient();

export async function universidadesSeeder() {

  for (const universidad of universidadesData) {

    await prisma.universidad.upsert({
      where: {
        nombre: universidad.nombre,
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