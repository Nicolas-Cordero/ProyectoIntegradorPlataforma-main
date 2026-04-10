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

@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.postgres.host'),
        port: configService.get('database.postgres.port'),
        username: configService.get('database.postgres.username'),
        password: configService.get('database.postgres.password'),
        database: configService.get('database.postgres.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.postgres.synchronize'),
        logging: configService.get('database.postgres.logging'),
      }),
    }),

    // === MÓDULOS LEGACY ===
    EstudianteModule,
    FamiliaModule,
    RamosCursadosModule,
    HistorialAcademicoModule,
    InformacionAcademicaModule,
    InstitucionModule,
    UsersModule,
    EntrevistasModule,
    AuthModule,
    SeederModule,

    // === MÓDULOS REFACTORIZADOS ===
    InformacionContactoModule,
    EstadoAcademicoModule,
    InformacionAdmisionModule,
    FamiliarModule,
    BeneficiosModule,
    PeriodoAcademicoModule,
  ],
})
export class AppModule {}
