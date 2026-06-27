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
import { ChangePasswordDto, ChangeOwnPasswordDto } from '../auth/dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRol } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Post()
  @Roles(UserRol.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }



  @Get()
  @Roles(UserRol.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }


  @Get(':rut')
  @Roles(UserRol.ADMIN)
  async findOne(@Param('rut') rut: string) {
    return this.usersService.findOne(rut);
  }


  @Patch(':rut')
  @Roles(UserRol.ADMIN)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('rut') rut: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(rut, updateUserDto);
  }


  @Delete(':rut')
  @Roles(UserRol.ADMIN)
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
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.usersService.changePassword(rut, changePasswordDto.password);
    return { message: 'Contraseña actualizada exitosamente' };
  }


  @Patch(':rut/password/change')
  @HttpCode(HttpStatus.OK)
  async changeOwnPassword(
    @Param('rut') rut: string,
    @Body() changeOwnPasswordDto: ChangeOwnPasswordDto,
  ): Promise<{ message: string }> {
    await this.usersService.changeOwnPassword(
      rut,
      changeOwnPasswordDto.currentPassword,
      changeOwnPasswordDto.newPassword,
    );
    return { message: 'Contraseña actualizada exitosamente' };
  }
}
