import { PrismaClient } from '@prisma/client';

import { 
  usersSeeder,
  beneficiosSeeder,
  liceosSeeder,
  universidadesSeeder,
  semestresSeeder,
  } from './seeds';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeders...');

  await beneficiosSeeder();
  await liceosSeeder();
  await universidadesSeeder();
  await usersSeeder();
  await semestresSeeder();

  console.log('All seeders executed successfully');
}

main()
  .catch((error) => {
    console.error('Seeder error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });