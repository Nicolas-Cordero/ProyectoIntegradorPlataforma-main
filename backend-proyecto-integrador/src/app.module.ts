import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstudianteModule } from './estudiante/estudiante.module';
import { FamiliaModule } from './familia/familia.module';
import { RamosCursadosModule } from './ramos_cursados/ramos_cursados.module';
import { HistorialAcademicoModule } from './historial_academico/historial_academico.module';
import { InformacionAcademicaModule } from './informacion_academica/informacion_academica.module';
import { InstitucionModule } from './institucion/institucion.module';
import { UsersModule } from './users/users.module';
import { EntrevistasModule } from './entrevistas/entrevistas.module';
import { AuthModule } from './auth/auth.module';
import { SeederModule } from './seeder/seeder.module';
import { appConfig, databaseConfig, jwtConfig } from './config';

// === MÓDULOS REFACTORIZADOS ===
import { InformacionContactoModule } from './informacion-contacto/informacion-contacto.module';
import { EstadoAcademicoModule } from './estado-academico/estado-academico.module';
import { InformacionAdmisionModule } from './informacion-admision/informacion-admision.module';
import { FamiliarModule } from './familiar/familiar.module';
import { BeneficiosModule } from './beneficios/beneficios.module';
import { PeriodoAcademicoModule } from './periodo-academico/periodo-academico.module';

import { PrismaService } from './prisma/prisma.service';
import { BeneficioEstudianteModule } from './beneficio-estudiante/beneficio-estudiante.module';
import { ComentarioModule } from './comentario/comentario.module';
import { LiceoModule } from './liceo/liceo.module';
import { RamoModule } from './ramo/ramo.module';
import { CarreraModule } from './carrera/carrera.module';
import { UniversidadModule } from './universidad/universidad.module';

@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    AuthModule,
    BeneficioEstudianteModule,
    ComentarioModule,
    LiceoModule,
    RamoModule,
    CarreraModule,
    UniversidadModule

  ],
  providers: [PrismaService]
})
export class AppModule {}
