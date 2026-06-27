import 'dotenv/config'
import { prisma } from './prisma-client';

import { 
  usersSeeder,
  beneficiosSeeder,
  liceosSeeder,
  universidadesSeeder,
  semestresSeeder,
  compromisoSeeder

  } from './seeds';


async function main() {
  console.log('Starting seeders...');

  await beneficiosSeeder();
  await liceosSeeder();
  await universidadesSeeder();
  await usersSeeder();
  await semestresSeeder();
  await compromisoSeeder();

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