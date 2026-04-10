import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import { usersData } from '../data/users.data';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSeeder {
  private readonly logger = new Logger(UserSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async run(): Promise<number> {
    this.logger.log('📝 Ejecutando UserSeeder...');
    let createdCount = 0;

    for (const userData of usersData) {
      try {
        // Buscar usuario existente
        this.logger.log(`🔍 Buscando usuario: ${userData.email}`);
        const existingUser = await this.userRepository.findOne({
          where: { email: userData.email },
        });

        if (existingUser) {
          this.logger.warn(
            `⚠️ Usuario ya existe: ${userData.username} (ID: ${existingUser.id})`,
          );
          continue;
        }

        this.logger.log(`Creando usuario: ${userData.username}`);

        // Si NO existe, crear nuevo usuario
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const user = this.userRepository.create({
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          nombre: userData.nombre,
          apellido: userData.apellido,
          rol: userData.rol as UserRole,
          activo: userData.activo ?? true,
        });

        this.logger.log(`💾 Guardando usuario en BD...`);
        const savedUser = await this.userRepository.save(user);
        createdCount++;

        this.logger.log(
          `✅ Usuario creado exitosamente: ${savedUser.username} (ID: ${savedUser.id}, Email: ${savedUser.email})`,
        );
      } catch (error) {
        this.logger.error(
          `❌ Error creando usuario ${userData.username}:`,
          error.message,
        );
        this.logger.error('Stack:', error.stack);
      }
    }

    this.logger.log(`UserSeeder completado: ${createdCount} registros creados`);
    return createdCount;
  }
}