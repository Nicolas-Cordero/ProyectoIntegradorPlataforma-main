import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { BeneficioEstudianteService } from './beneficio-estudiante.service';
import { CreateBeneficioEstudianteDto } from './dto/create-beneficio-estudiante.dto';
import { UpdateBeneficioEstudianteDto } from './dto/update-beneficio-estudiante.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRol } from '@prisma/client';

/**
 * Asignaciones beneficio ↔ estudiante. La llave es compuesta
 * (`codigo_beneficio` + `rut_estudiante`): no existe un id propio, por eso
 * todas las rutas de detalle llevan ambos segmentos.
 *
 * OJO: este controller cuelga de `beneficios/estudiantes`, que también encaja
 * en el `@Get(':id')` de BeneficiosController. Depende de que
 * BeneficioEstudianteModule se registre ANTES que BeneficiosModule en
 * app.module.ts — ver la nota allí.
 */
@Controller('beneficios/estudiantes')
@Roles(UserRol.ADMIN, UserRol.TUTOR, UserRol.VISITA)
export class BeneficioEstudianteController {
  constructor(
    private readonly beneficioEstudianteService: BeneficioEstudianteService,
  ) {}

  /**
   * Los parámetros de la ruta mandan sobre el cuerpo: si discrepan, gana la URL
   * en vez de aplicarse el cuerpo en silencio.
   */
  @Post(':id_beneficio/:rut_estudiante')
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  create(
    @Param('id_beneficio', ParseIntPipe) codigo_beneficio: number,
    @Param('rut_estudiante') rut_estudiante: string,
    @Body() createBeneficioEstudianteDto: CreateBeneficioEstudianteDto,
  ) {
    return this.beneficioEstudianteService.createAssociation({
      ...createBeneficioEstudianteDto,
      codigo_beneficio,
      rut_estudiante,
    });
  }

  @Get()
  findAll() {
    return this.beneficioEstudianteService.findAllAssociations();
  }

  /** Asignaciones de un beneficio, cada una con su estudiante. */
  @Get(':id_beneficio')
  findAssociationsByBeneficio(
    @Param('id_beneficio', ParseIntPipe) codigo_beneficio: number,
  ) {
    return this.beneficioEstudianteService.findAssociationsByBeneficio(
      codigo_beneficio,
    );
  }

  /** Asignaciones de un estudiante, cada una con su beneficio del catálogo. */
  @Get('rut/:rut_estudiante')
  findAssociationsByEstudiante(
    @Param('rut_estudiante') rut_estudiante: string,
  ) {
    return this.beneficioEstudianteService.findAssociationsByEstudiante(
      rut_estudiante,
    );
  }

  @Get(':id_beneficio/:rut_estudiante')
  findOneAssociation(
    @Param('id_beneficio', ParseIntPipe) codigo_beneficio: number,
    @Param('rut_estudiante') rut_estudiante: string,
  ) {
    return this.beneficioEstudianteService.findOneAssociation(
      codigo_beneficio,
      rut_estudiante,
    );
  }

  @Patch(':id_beneficio/:rut_estudiante')
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  update(
    @Param('id_beneficio', ParseIntPipe) codigo_beneficio: number,
    @Param('rut_estudiante') rut_estudiante: string,
    @Body() updateBeneficioEstudianteDto: UpdateBeneficioEstudianteDto,
  ) {
    return this.beneficioEstudianteService.update(
      codigo_beneficio,
      rut_estudiante,
      updateBeneficioEstudianteDto,
    );
  }

  @Delete(':id_beneficio/:rut_estudiante')
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  remove(
    @Param('id_beneficio', ParseIntPipe) codigo_beneficio: number,
    @Param('rut_estudiante') rut_estudiante: string,
  ) {
    return this.beneficioEstudianteService.remove(
      codigo_beneficio,
      rut_estudiante,
    );
  }
}
