import { Module } from '@nestjs/common';
import { ConfigModule} from '@nestjs/config';
import { appConfig, jwtConfig } from './config';

import { PrismaService } from './prisma/prisma.service';

import { AuthModule } from './auth';
import { BeneficioEstudianteModule } from './beneficio-estudiante';
import { BeneficiosModule } from './beneficios';
import { CarreraModule } from './carrera';
import { ComentarioModule } from './comentario';
import { EntrevistasModule } from './entrevistas';
import { EstudianteModule } from './estudiante';
import { FamiliarModule } from './familiar';
import { LiceoModule } from './liceo';
import { RamoModule } from './ramo';
import { UniversidadModule } from './universidad/universidad.module';
import { UsersModule } from './users';
import { SemestreModule } from './semestre/semestre.module';
import { PrismaModule } from './prisma/prisma.module';





@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    AuthModule,
    BeneficioEstudianteModule,
    BeneficiosModule,
    CarreraModule,
    ComentarioModule,
    EntrevistasModule,
    EstudianteModule,
    FamiliarModule,
    LiceoModule,
    RamoModule,
    UniversidadModule,
    UsersModule,
    SemestreModule,
  ],
  providers: [PrismaService]
})
export class AppModule {}
