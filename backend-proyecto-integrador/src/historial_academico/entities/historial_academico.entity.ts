import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Estudiante } from '../../estudiante/entities/estudiante.entity';

@Entity('historial_academico')
export class HistorialAcademico {
  @PrimaryColumn('uuid')
  id_historial_academico: string;

  @BeforeInsert()
  generateId() {
    this.id_historial_academico = uuidv4();
  }

  // === CAMPOS LEGACY ELIMINADOS ===
  // año y semestre fueron migrados a periodo_academico (centralizado)
  // Usar la relación periodo_academico_estudiante en su lugar

  @Column({ nullable: true, default: null })
  nivel_educativo: string;

  @Column({ nullable: true, type: 'int' })
  año: number;

  @Column({ nullable: true, type: 'int' })
  semestre: number;

  @Column({ nullable: true, default: null })
  ramos_aprobados: number;

  @Column({ nullable: true, default: null })
  ramos_reprobados: number;

  @Column({ nullable: true, default: 0 })
  ramos_eliminados: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  promedio_semestre: number;

  @Column({ type: 'json', nullable: true, default: () => "'[]'" })
  trayectoria_academica: string[];

  @Column({ type: 'text', nullable: true, default: null })
  observaciones: string;

  @Column({ type: 'text', nullable: true, default: null })
  comentarios_generales: string;

  @Column({ type: 'text', nullable: true, default: null })
  dificultades: string;

  @Column({ type: 'text', nullable: true, default: null })
  aprendizajes: string;

  @Column({ nullable: true, default: null })
  ultima_actualizacion_por: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relación con Estudiante
  @ManyToOne(() => Estudiante, (estudiante) => estudiante.historialesAcademicos)
  @JoinColumn({ name: 'id_estudiante' })
  estudiante: Estudiante;
}
