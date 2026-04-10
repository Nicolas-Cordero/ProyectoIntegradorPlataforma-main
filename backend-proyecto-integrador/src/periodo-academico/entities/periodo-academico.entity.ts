import {
  Entity,
  PrimaryColumn,
  Column,
  Index,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('periodo_academico')
@Index(['año', 'semestre'], { unique: true })
export class PeriodoAcademico {
  @PrimaryColumn('uuid')
  id_periodo_academico: string;

  @BeforeInsert()
  generateId() {
    this.id_periodo_academico = uuidv4();
  }

  @Column({ type: 'int' })
  año: number;

  @Column({ type: 'int' })
  semestre: number;

  @Column({ type: 'date', nullable: true })
  fecha_inicio: Date;

  @Column({ type: 'date', nullable: true })
  fecha_fin: Date;

  @Column({ default: false })
  es_actual: boolean;

  @Column({ type: 'text', nullable: true })
  observaciones: string;
}
