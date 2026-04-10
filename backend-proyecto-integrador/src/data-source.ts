// src/data-source.ts
import { DataSource } from 'typeorm';
import { Estudiante } from './estudiante/entities/estudiante.entity';
import { Familia } from './familia/entities/familia.entity';
import { RamosCursados } from './ramos_cursados/entities/ramos_cursado.entity';
import { HistorialAcademico } from './historial_academico/entities/historial_academico.entity';
import { InformacionAcademica } from './informacion_academica/entities/informacion_academica.entity';
import { User } from './users/entities/user.entity';
import { Institucion } from './institucion/entities/institucion.entity';
import { Entrevista } from './entrevistas/entities/entrevista.entity';
import { Texto } from './entrevistas/entities/texto.entity';
import { Etiqueta } from './entrevistas/entities/etiqueta.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'db',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'myapp',
  synchronize: true, // Solo para desarrollo
  logging: true,
  entities: [
    Estudiante,
    Familia,
    RamosCursados,
    HistorialAcademico,
    InformacionAcademica,
    User,
    Institucion,
    Entrevista,
    Texto,
    Etiqueta,
  ],
});
