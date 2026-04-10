import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  OneToOne,
} from 'typeorm';
import { Institucion } from '../../institucion/entities/institucion.entity';
import { RamosCursados } from '../../ramos_cursados/entities/ramos_cursado.entity';
import { HistorialAcademico } from '../../historial_academico/entities/historial_academico.entity';
import { InformacionAcademica } from '../../informacion_academica/entities/informacion_academica.entity';
import { Entrevista } from '../../entrevistas/entities/entrevista.entity';
import { Familia } from '../../familia/entities/familia.entity';
import { v4 as uuidv4 } from 'uuid';

export enum TipoEstudiante {
  MEDIA = 'media',
  UNIVERSITARIO = 'universitario',
}

// StatusEstudiante movido a estado-academico module
// Los campos de contacto (telefono, email, direccion) movidos a informacion-contacto module

@Entity('estudiante')
export class Estudiante {
  @PrimaryColumn('uuid')
  id_estudiante: string;

  @BeforeInsert()
  generateId() {
    this.id_estudiante = uuidv4();
  }

  // === CAMPOS CORE (identificación personal) ===
  @Column()
  nombre: string;

  @Column({ unique: true })
  rut: string;

  @Column()
  fecha_de_nacimiento: Date;

  @Column({ nullable: true })
  genero: string;

  // === TIPO DE ESTUDIANTE ===
  @Column({
    type: 'enum',
    enum: TipoEstudiante,
  })
  tipo_de_estudiante: TipoEstudiante;

  @Column({ nullable: true, default: null })
  generacion: string;

  @Column({ type: 'int', nullable: true, default: null })
  numero_carrera: number;

  // === OBSERVACIONES GENERALES ===
  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'text', nullable: true })
  foto_url?: string;

  // === RELACIÓN CON INSTITUCIÓN ACTUAL ===
  @Column({ type: 'uuid', nullable: true })
  id_institucion?: string;

  @ManyToOne(() => Institucion, (institucion) => institucion.estudiantes, {
    nullable: true,
  })
  @JoinColumn({ name: 'id_institucion' })
  institucion?: Institucion;

  // === RELACIONES CON MÓDULOS REFACTORIZADOS ===
  // InformacionContacto (1:1) - telefono, email, direccion
  // EstadoAcademico (1:1) - status, status_detalle, semestres_suspendidos, semestres_total_carrera
  // InformacionAdmision (1:1) - puntajes PAES, ensayos
  // Familiar (1:N) - familiares relacionados
  // BeneficioEstudiante (1:N) - beneficios del estudiante
  // PeriodoAcademicoEstudiante (1:N) - historial por períodos

  // === RELACIONES LEGACY (se mantendrán hasta migración) ===
  @OneToMany(() => RamosCursados, (ramo: RamosCursados) => ramo.estudiante)
  ramosCursados: RamosCursados[];

  @OneToMany(() => HistorialAcademico, (historial: HistorialAcademico) => historial.estudiante)
  historialesAcademicos: HistorialAcademico[];

  @OneToMany(() => InformacionAcademica, (info: InformacionAcademica) => info.estudiante, {
    nullable: true,
  })
  informacionAcademica: InformacionAcademica[];

  @OneToOne(() => Familia, (familia: Familia) => familia.estudiante, {
    nullable: true,
  })
  familia?: Familia;

  @OneToMany(() => Entrevista, (entrevista) => entrevista.estudiante)
  entrevistas: Entrevista[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
