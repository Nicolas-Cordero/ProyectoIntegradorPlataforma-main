import { PrismaClient } from "@prisma/client";
import { liceosData } from "../data";

const prisma = new PrismaClient();

export async function liceosSeeder() {

  for (const liceo of liceosData) {

    await prisma.liceo.upsert({
      where: {
        rbd: liceo.rbd,
      },
      update: {},
      create: {
        rbd: liceo.rbd,
        nombre: liceo.nombre,
        comuna: liceo.comuna,
        especialidad: liceo.especialidad,
      },
    });
  }

  console.log('Liceos seeded successfully');
}