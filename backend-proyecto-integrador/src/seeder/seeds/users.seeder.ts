import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { usersData } from '../data/users.data';

const prisma = new PrismaClient();

export async function usersSeeder() {
  const saltRounds = 10;

  for (const user of usersData) {
    const hashedPassword = await bcrypt.hash(
      user.password,
      saltRounds,
    );

    await prisma.usuario.upsert({
      where: {
        rut_usuario: user.rut_usuario,
      },
      update: {},
      create: {
        rut_usuario: user.rut_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono,
        rol: user.rol,
        password: hashedPassword,
      },
    });
  }

  console.log('Users seeded successfully');
}