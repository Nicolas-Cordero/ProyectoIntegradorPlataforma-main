import { prisma } from '../prisma-client';

import { universidadesData } from '../data/';

// Requiere el catálogo de comunas ya cargado (comunasSeeder).
export async function universidadesSeeder() {
  const comunas = await prisma.comuna.findMany();
  const codigoPorNombre = new Map(
    comunas.map((c) => [c.nombre, c.codigo_comuna]),
  );

  for (const universidad of universidadesData) {
    const codigo_comuna = codigoPorNombre.get(universidad.comuna);
    if (codigo_comuna === undefined) {
      throw new Error(
        `Comuna "${universidad.comuna}" de ${universidad.nombre} no existe en el catálogo`,
      );
    }
    await prisma.universidad.upsert({
      where: {
        nombre_codigo_comuna: { nombre: universidad.nombre, codigo_comuna },
      },
      update: {},
      create: { nombre: universidad.nombre, codigo_comuna },
    });
  }

  console.log('Universidades seeded successfully');
}
