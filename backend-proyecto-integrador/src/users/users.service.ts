import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { usuario } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<usuario> {
    // Verificar si el email ya existe
    const existingUser = await this.usersRepo.findByEmail(createUserDto.email);
    const existingRut = await this.usersRepo.findByRut(createUserDto.rut_usuario);
    if (existingRut) {
      throw new ConflictException('El RUT ya está en uso');
    }
    if (existingUser) {
      throw new ConflictException('El email ya está en uso');
    }
    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
    createUserDto.password = hashedPassword;

    return this.usersRepo.registerNewUser(createUserDto);
  }



  async findAll(): Promise<usuario[]> {
    return this.usersRepo.findAll();
  }



  async findOne(rut: string): Promise<usuario> {
    const user = await this.usersRepo.findByRut(rut);
    if (!user) {
      throw new NotFoundException(`Usuario con RUT ${rut} no encontrado`);
    }
    return user;
  }
  



  async findByEmail(email: string): Promise<usuario> {
    const user = await this.usersRepo.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    } 
    return user;
  }


  async update(rut: string, updateUserDto: UpdateUserDto): Promise<usuario> {
    const user = await this.usersRepo.findByRut(rut);

    if (!user) {
      throw new NotFoundException(`Usuario con RUT ${rut} no encontrado`);
    }
    // Verificar si el nuevo email o username ya existe (si se está actualizando)
    if (updateUserDto.email) {
      const existingUser = await this.usersRepo.findByEmail(updateUserDto.email);

      if (existingUser) {
        throw new ConflictException('El email o username ya está en uso');
      }
    }

    return this.usersRepo.update(rut, updateUserDto);
  }


  async remove(rut: string): Promise<usuario> {
    const result = await this.usersRepo.delete(rut);
    if (!result) {
      throw new NotFoundException(`Usuario con RUT ${rut} no encontrado`);
    }
    return result;
  }

  async updateLastLogin(rut: string): Promise<void> {
    await this.usersRepo.updateLastLogin(rut);
  }


  async updateResetToken(rut: string, refreshToken: string): Promise<void> {
    const expireDate =  new Date(Date.now() + 15* 60 * 1000); // Expira en 15 minutos
    await this.usersRepo.updateResetToken(rut, refreshToken, expireDate);
  }



  async validateUser(rut: string, password: string): Promise<usuario | null> {
    const user = await this.usersRepo.findByRut(rut);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }



  async changePassword(rut: string, newPassword: string): Promise<void> {
    const user = await this.usersRepo.findByRut(rut);
    
    if (!user) {
      throw new NotFoundException(`Usuario con RUT ${rut} no encontrado`);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await this.usersRepo.update(rut, {
      password: hashedPassword,
    });
  }


  async changeOwnPassword(rut: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersRepo.findByRut(rut);
    
    if (!user) {
      throw new NotFoundException(`Usuario con RUT ${rut} no encontrado`);
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    // Hashear nueva contraseña
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await this.usersRepo.update(rut, {
      password: hashedNewPassword,
    });
  }
}
