import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserSeeder } from './seeds/user.seeder';

async function runSeeders() {
  console.log('🌱 Iniciando proceso de seeding...\n');
  console.log('='.repeat(60) + '\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userSeeder = app.get(UserSeeder);

    let totalCreated = 0;

    const created = await userSeeder.run();
    totalCreated += created;

    console.log('='.repeat(60));
    console.log(`✨ SEEDING COMPLETADO: ${totalCreated} registros creados\n`);

    // Mostrar resumen de credenciales
    console.log('📋 CREDENCIALES DE LOGIN:');
    console.log('━'.repeat(60));
    console.log('👤 ADMINISTRADOR');
    console.log('   Username: admin');
    console.log('   Email:    admin@fundacion.cl');
    console.log('   Password: admin123');
    console.log('   Rol:      admin');
    console.log('━'.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error ejecutando seeders:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runSeeders().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
