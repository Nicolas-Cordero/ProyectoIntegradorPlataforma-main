import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si ya existe un usuario con el mismo email o username
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    if (existingUser) {
      throw new ConflictException('El email o username ya está en uso');
    }

    // Hash del password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findAll(filters: Partial<User> = {}): Promise<User[]> {
    // Limpiar campos nulos del filtro para evitar problemas con TypeORM
    const cleanFilters: any = {};
    Object.keys(filters).forEach((key) => {
      const value = filters[key as keyof User];
      if (value !== null && value !== undefined) {
        cleanFilters[key] = value;
      }
    });

    return this.usersRepository.find({
      where: cleanFilters,
      select: [
        'id',
        'username',
        'email',
        'nombre',
        'apellido',
        'rol',
        'activo',
        'ultimo_login',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'username',
        'email',
        'nombre',
        'apellido',
        'rol',
        'activo',
        'ultimo_login',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Si se está actualizando el password, hashearlo
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Verificar si el nuevo email o username ya existe (si se está actualizando)
    if (updateUserDto.email || updateUserDto.username) {
      const existingUser = await this.usersRepository.findOne({
        where: [
          { email: updateUserDto.email, id: Not(id) },
          { username: updateUserDto.username, id: Not(id) },
        ],
      });

      if (existingUser) {
        throw new ConflictException('El email o username ya está en uso');
      }
    }

    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      ultimo_login: new Date(),
    });
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await this.usersRepository.update(id, {
      refreshToken: refreshToken || undefined,
    });
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async changePassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await this.usersRepository.update(userId, {
      password: hashedPassword,
    });
  }

  async changeOwnPassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException(`Usuario no encontrado`);
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    // Hashear nueva contraseña
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await this.usersRepository.update(userId, {
      password: hashedNewPassword,
    });
  }
}
