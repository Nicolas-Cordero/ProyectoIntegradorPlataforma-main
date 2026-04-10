import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Estudiante } from '../../estudiante/entities/estudiante.entity';
import { Beneficio } from './beneficio.entity';

@Entity('beneficio_estudiante')
export class BeneficioEstudiante {
  @PrimaryColumn('uuid')
  id_beneficio_estudiante: string;

  @BeforeInsert()
  generateId() {
    this.id_beneficio_estudiante = uuidv4();
  }

  @Column({ type: 'uuid' })
  estudiante_id: string;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ type: 'uuid' })
  beneficio_id: string;

  @ManyToOne(() => Beneficio)
  @JoinColumn({ name: 'beneficio_id' })
  beneficio: Beneficio;

  @Column({ type: 'int' })
  año_inicio: number;

  @Column({ type: 'int', nullable: true })
  año_termino: number;

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn()
  created_at: Date;
}
