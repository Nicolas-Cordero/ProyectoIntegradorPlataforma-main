import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule} from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { appConfig, jwtConfig } from './config';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

import { PrismaService } from './prisma/prisma.service';

import { AuthModule } from './auth';
import { BeneficioEstudianteModule } from './beneficio-estudiante';
import { BeneficiosModule } from './beneficios';
import { CarreraModule } from './carrera';
import { ComentarioModule } from './comentario';
import { EntrevistasModule } from './entrevistas';
import { EstudianteModule } from './estudiante';
import { FamiliarModule } from './familiar';
import { GeneracionesModule } from './generaciones/generaciones.module';
import { LiceoModule } from './liceo';
import { RamoModule } from './ramo';
import { UniversidadModule } from './universidad/universidad.module';
import { UsersModule } from './users';
import { SemestreModule } from './semestre/semestre.module';
import { PrismaModule } from './prisma/prisma.module';
import { AlertasModule } from './alertas/alertas.module';
import { StorageModule } from './storage/storage.module';
import { PaesModule } from './paes/paes.module';
import { AcuerdoModule } from './acuerdo/acuerdo.module';
import { PdfGeneratorModule } from './pdf-generator/pdf-generator.module';
import { HistorialEstadoCarreraModule } from './historial-estado-carrera';





@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60000,
        limit: 120,
      },
    ]),
    PrismaModule,
    AuthModule,
    BeneficioEstudianteModule,
    BeneficiosModule,
    CarreraModule,
    ComentarioModule,
    EntrevistasModule,
    EstudianteModule,
    FamiliarModule,
    GeneracionesModule,
    LiceoModule,
    RamoModule,
    UniversidadModule,
    UsersModule,
    SemestreModule,
    AlertasModule,
    StorageModule,
    PaesModule,
    AcuerdoModule,
    PdfGeneratorModule,
    HistorialEstadoCarreraModule,
  ],
  providers: [
    PrismaService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
