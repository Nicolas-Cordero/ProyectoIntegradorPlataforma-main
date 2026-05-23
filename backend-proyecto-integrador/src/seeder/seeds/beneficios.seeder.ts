import { prisma } from '../prisma-client';
import { beneficiosData } from "../data";

export async function beneficiosSeeder() {

  for (const beneficio of beneficiosData) {

    await prisma.beneficio.upsert({
      where: {
        nombre: beneficio.nombre,
      },
      update: {},
      create: {
        nombre: beneficio.nombre,
        proveedor: beneficio.proveedor,
        tipo: beneficio.tipo,
        descripcion: beneficio.descripcion,
        monto: beneficio.monto,
      },
    });
  }

  console.log('Beneficios seeded successfully');
}