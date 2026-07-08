import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AcuerdoService } from './acuerdo.service';
import { CreateAcuerdoDto } from './dto/create-acuerdo.dto';
import { UpdateAcuerdoDto } from './dto/update-acuerdo.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/auth.interfaces';
import { UserRol } from '@prisma/client';

// JwtAuthGuard y RolesGuard se aplican globalmente (APP_GUARD en AppModule);
// aquí solo se declaran los roles por endpoint. Sin @Roles = cualquier autenticado.
@Controller('acuerdo')
export class AcuerdoController {
  constructor(private readonly acuerdoService: AcuerdoService) {}

  @Post()
  @Roles(UserRol.ADMIN)
  create(@Body() createAcuerdoDto: CreateAcuerdoDto) {
    return this.acuerdoService.create(createAcuerdoDto);
  }

  @Get()
  findAll() {
    return this.acuerdoService.findAll();
  }

  @Get('vigente')
  findVigente(@Query('fecha') fecha?: string) {
    const fechaObjetivo = fecha ? new Date(fecha) : new Date();
    if (Number.isNaN(fechaObjetivo.getTime())) {
      throw new BadRequestException(`La fecha "${fecha}" no es válida`);
    }
    return this.acuerdoService.findMostNear(fechaObjetivo);
  }

  // El estudiante firma la versión vigente del acuerdo (resuelta en el servidor).
  @Post('firmar')
  @Roles(UserRol.ESTUDIANTE)
  firmar(@CurrentUser() user: AuthenticatedUser) {
    return this.acuerdoService.firmarVigente(user.rut_usuario);
  }

  // El estudiante consulta si ya firmó la versión vigente del acuerdo.
  @Get('me/estado')
  @Roles(UserRol.ESTUDIANTE)
  estadoFirma(@CurrentUser() user: AuthenticatedUser) {
    return this.acuerdoService.getEstadoFirmaVigente(user.rut_usuario);
  }

  // Estudiantes que firmaron una versión concreta del acuerdo (pestaña "Firmas").
  @Get(':id/firmas')
  @Roles(UserRol.ADMIN)
  getFirmantes(@Param('id') id: string) {
    return this.acuerdoService.getFirmantes(+id);
  }

  @Patch(':id')
  @Roles(UserRol.ADMIN)
  update(@Param('id') id: string, @Body() updateAcuerdoDto: UpdateAcuerdoDto) {
    return this.acuerdoService.update(+id, updateAcuerdoDto);
  }

  @Delete(':id')
  @Roles(UserRol.ADMIN)
  remove(@Param('id') id: string) {
    return this.acuerdoService.remove(+id);
  }
}
