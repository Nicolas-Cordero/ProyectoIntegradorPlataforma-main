import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Estudiante } from '../../estudiante/entities/estudiante.entity';
import type { ObservacionesFamiliares } from '../../common/index';

@Entity('familias')
export class Familia {
  @PrimaryColumn('uuid')
  id_familia: string;

  @BeforeInsert()
  generateId() {
    this.id_familia = uuidv4();
  }

  // Campos básicos solicitados por el frontend actual
  @Column({ type: 'varchar', length: 255, nullable: true })
  nombre_madre?: string;

  @Column({ type: 'json', nullable: true, default: () => "'[]'" })
  descripcion_madre?: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  nombre_padre?: string;

  @Column({ type: 'json', nullable: true, default: () => "'[]'" })
  descripcion_padre?: string[];

  @Column({ type: 'json', nullable: true, default: () => "'[]'" })
  hermanos?: any[];

  @Column({ type: 'text', nullable: true })
  observaciones_hermanos?: string;

  @Column({ type: 'json', nullable: true, default: () => "'[]'" })
  otros_familiares?: any[];

  @Column({ type: 'text', nullable: true })
  observaciones_otros_familiares?: string;

  @Column({ type: 'json', nullable: true , default: { madre: [], padre: [], hermanos: [], general: [] } })
  observaciones: ObservacionesFamiliares;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relación con Estudiante
  @OneToOne(() => Estudiante)
  @JoinColumn({ name: 'id_estudiante' })
  estudiante: Estudiante;
}
