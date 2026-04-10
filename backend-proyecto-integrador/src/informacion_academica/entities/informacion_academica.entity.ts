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

@Entity('informacion_academica')
export class InformacionAcademica {
  @PrimaryColumn('uuid')
  id_info_academico: string;

  @BeforeInsert()
  generateId() {
    this.id_info_academico = uuidv4();
  }

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  promedio_1: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  promedio_2: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  promedio_3: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  promedio_4: number;

  @Column({ nullable: true, default: null })
  via_acceso: string;

  @Column({ nullable: true, default: null })
  año_ingreso_beca: number;

  @Column({ nullable: true, default: null })
  colegio: string;

  @Column({ nullable: true, default: null })
  especialidad_colegio: string;

  @Column({ nullable: true, default: null })
  comuna_colegio: string;

  @Column({ type: 'text', nullable: true })
  trayectoria_academica: string;

  // Puntajes de admisión (PAES) almacenados como JSON flexible o texto
  @Column({ type: 'jsonb', nullable: true })
  puntajes_admision: any;

  // === CAMPOS LEGACY ELIMINADOS ===
  // puntajes_admision migrado a informacion_admision (normalizado con puntajes específicos)
  // ensayos_paes migrado a ensayo_paes (entidad separada 1:N)
  // beneficios migrado a beneficio + beneficio_estudiante (catálogo + relación temporal)

  @Column({ type: 'text', nullable: true })
  beneficios: string;

  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" })
  resumen_semestres: any[];

  @Column({ nullable: true, default: null })
  ultima_actualizacion_por: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  promedio_acumulado: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relación con Estudiante
  @OneToOne(() => Estudiante, (estudiante) => estudiante.informacionAcademica)
  @JoinColumn({ name: 'id_estudiante' })
  estudiante: Estudiante;
}
