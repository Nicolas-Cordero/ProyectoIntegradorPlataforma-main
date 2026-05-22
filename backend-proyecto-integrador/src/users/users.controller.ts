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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRol, usuario } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Post()
  @Roles(UserRol.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<usuario> {
    return this.usersService.create(createUserDto);
  }



  @Get()
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  findAll(): Promise<usuario[]> {
    return this.usersService.findAll();
  }


  @Get(':rut')
  async findOne(@Param('rut') rut: string): Promise<usuario> {
    return this.usersService.findOne(rut);
  }


  @Patch(':rut')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('rut') rut: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<usuario> {
    return this.usersService.update(rut, updateUserDto);
  }


  @Delete(':rut')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('rut') rut: string): Promise<{message: string}> {
    await this.usersService.remove(rut);
    return { message: 'Usuario eliminado exitosamente' };
  }


  @Patch(':rut/password')
  @Roles(UserRol.ADMIN)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Param('rut') rut: string,
    @Body() changePasswordDto: { password: string },
  ): Promise<{ message: string }> {
    await this.usersService.changePassword(rut, changePasswordDto.password);
    return { message: 'Contraseña actualizada exitosamente' };
  }


  @Patch(':rut/password/change')
  @HttpCode(HttpStatus.OK)
  async changeOwnPassword(
    @Param('rut') rut: string,
    @Body() changeOwnPasswordDto: { currentPassword: string; newPassword: string },
  ): Promise<{ message: string }> {
    await this.usersService.changeOwnPassword(
      rut,
      changeOwnPasswordDto.currentPassword,
      changeOwnPasswordDto.newPassword,
    );
    return { message: 'Contraseña actualizada exitosamente' };
  }
}
