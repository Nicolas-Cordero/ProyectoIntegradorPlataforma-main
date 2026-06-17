import { prisma } from '../prisma-client';
import { compromisoData } from '../data';

export async function compromisoSeeder() {
  for (const compromiso of compromisoData) {
    const documento = compromiso.documento;

    await prisma.acuerdo.upsert({
      where: { id: 1 },
      update: { documento },
      create: { documento },
    });
  }

  console.log('compromiso seeded successfully');
}
