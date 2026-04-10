import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TUTOR)
  async findAll(
    @Query('activo') activo?: string,
    @Query('rol') rol?: string,
  ): Promise<User[]> {
    const filters: Partial<User> = {};
    if (activo !== undefined) {
      filters.activo = activo === 'true';
    }
    if (rol) {
      filters.rol = rol as UserRole;
    }
    return this.usersService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Get('username/:username')
  async findByUsername(@Param('username') username: string): Promise<User> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`Usuario ${username} no encontrado`);
    }
    return user;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  @Patch(':id/password')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: { password: string },
  ): Promise<{ message: string }> {
    await this.usersService.changePassword(id, changePasswordDto.password);
    return { message: 'Contraseña actualizada exitosamente' };
  }

  @Patch('profile/password')
  @HttpCode(HttpStatus.OK)
  async changeOwnPassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: { currentPassword: string; newPassword: string },
  ): Promise<{ message: string }> {
    await this.usersService.changeOwnPassword(user.id, changePasswordDto.currentPassword, changePasswordDto.newPassword);
    return { message: 'Contraseña actualizada exitosamente' };
  }
}
