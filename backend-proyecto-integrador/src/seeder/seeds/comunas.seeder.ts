import { prisma } from '../prisma-client';

import { comunasData } from '../data/';

export async function comunasSeeder() {
  await prisma.comuna.createMany({ data: comunasData, skipDuplicates: true });

  console.log('Comunas seeded successfully');
}
