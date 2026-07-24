import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { EstudianteService } from './estudiante.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { CreateEstudiantesBulkDto } from './dto/create-estudiantes-bulk.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRol } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/interfaces/auth.interfaces';
import { StorageService } from '../storage/storage.service';

@Controller('estudiante')
export class EstudianteController {
  constructor(
    private readonly estudianteService: EstudianteService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @Roles(UserRol.ADMIN)
  create(@Body() createEstudianteDto: CreateEstudianteDto) {
    return this.estudianteService.create(createEstudianteDto);
  }

  // Carga masiva (importación por Excel). Todo-o-nada: si un solo estudiante
  // falla, la transacción hace rollback y no se inserta ninguno.
  @Post('bulk')
  @Roles(UserRol.ADMIN)
  createMany(@Body() createEstudiantesBulkDto: CreateEstudiantesBulkDto) {
    return this.estudianteService.createMany(
      createEstudiantesBulkDto.estudiantes,
    );
  }

  @Get()
  @Roles(UserRol.ADMIN, UserRol.TUTOR, UserRol.VISITA, UserRol.ESTUDIANTE)
  findAll(@Query('soloActivos') soloActivos?: string) {
    return this.estudianteService.findAll(soloActivos === 'true');
  }

  // El estudiante consulta su propia información (rut tomado del JWT).
  // Debe declararse antes de las rutas con :rut_estudiante.
  @Get('me')
  @Roles(UserRol.ESTUDIANTE)
  findMe(@CurrentUser() user: AuthenticatedUser) {
    return this.estudianteService.findOneComplete(user.rut_usuario);
  }

  @Get('generacion/:generacion_id')
  @Roles(UserRol.ADMIN, UserRol.TUTOR, UserRol.VISITA)
  findByGeneracion(
    @Param('generacion_id', ParseIntPipe) generacion_id: number,
  ) {
    return this.estudianteService.findByGeneracion(generacion_id);
  }

  //TODO: SIMPLE DEBERIA DEVOLVER LA INFO JUSTA Y NECESARIA PARA EL PERFIL
  // Revisar las de abajo
  @Get(':rut_estudiante/simple')
  @Roles(UserRol.ADMIN, UserRol.TUTOR, UserRol.VISITA)
  findOne(@Param('rut_estudiante') rut_estudiante: string) {
    return this.estudianteService.findOneSimple(rut_estudiante);
  }

  //COMPLETE DEBERIA DEVOLVER LA INFO PARA "DATOS PERSONALES."
  @Get(':rut_estudiante/complete')
  @Roles(UserRol.ADMIN, UserRol.TUTOR, UserRol.VISITA)
  findOneComplete(@Param('rut_estudiante') rut_estudiante: string) {
    return this.estudianteService.findOneComplete(rut_estudiante);
  }

  @Patch(':rut_estudiante')
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  update(
    @Param('rut_estudiante') rut_estudiante: string,
    @Body() updateEstudianteDto: UpdateEstudianteDto,
  ) {
    return this.estudianteService.update(rut_estudiante, updateEstudianteDto);
  }

  // El estudiante sube su propia foto (rut tomado del JWT).
  // Debe ir ANTES de :rut_estudiante/foto para no ser capturado por esa ruta.
  @Post('me/foto')
  @Roles(UserRol.ESTUDIANTE)
  @UseInterceptors(FileInterceptor('foto', { storage: memoryStorage() }))
  async uploadMyFoto(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { url } = await this.storageService.uploadImage(file, 'perfil');
    await this.estudianteService.update(user.rut_usuario, { foto_url: url });
    return { foto_url: url };
  }

  @Post(':rut_estudiante/foto')
  @Roles(UserRol.ADMIN)
  @UseInterceptors(FileInterceptor('foto', { storage: memoryStorage() }))
  async uploadFoto(
    @Param('rut_estudiante') rut_estudiante: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { url } = await this.storageService.uploadImage(file, 'perfil');
    await this.estudianteService.update(rut_estudiante, { foto_url: url });
    return { foto_url: url };
  }

  @Delete(':id')
  @Roles(UserRol.ADMIN)
  remove(@Param('id') id: string) {
    return this.estudianteService.remove(id);
  }

  // @Get('estadisticas')
  // findStadistics(){
  //   return this.estudianteService.findStadistics();
  // }
}
