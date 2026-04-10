import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Estudiante } from '../../estudiante/entities/estudiante.entity';

export enum StatusEstudiante {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  EGRESADO = 'egresado',
  RETIRADO = 'retirado',
}

@Entity('estado_academico')
export class EstadoAcademico {
  @PrimaryColumn('uuid')
  id_estado_academico: string;

  @BeforeInsert()
  generateId() {
    this.id_estado_academico = uuidv4();
  }

  @Column({ type: 'uuid', unique: true })
  estudiante_id: string;

  @OneToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({
    type: 'enum',
    enum: StatusEstudiante,
    nullable: true,
  })
  status: StatusEstudiante;

  @Column({ type: 'text', nullable: true })
  status_detalle: string;

  @Column({ type: 'int', default: 0 })
  semestres_cursados: number;

  @Column({ type: 'int', default: 0 })
  semestres_suspendidos: number;

  @Column({ type: 'int', default: 10 })
  semestres_totales_carrera: number;

  @Column({ nullable: true })
  generacion: string;

  @Column({ type: 'int', nullable: true })
  numero_carrera: number;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  updated_by: string;
}
