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
import { PeriodoAcademicoEstudiante } from '../../periodo-academico/entities/periodo-academico-estudiante.entity';

@Entity('ramos_cursados')
export class RamosCursados {
  @PrimaryColumn('uuid')
  id_ramo: string;

  @BeforeInsert()
  generateId() {
    this.id_ramo = uuidv4();
  }

  // === PERIODO ACADÉMICO (normalizado) ===
  @Column({ type: 'uuid', nullable: true })
  periodo_academico_estudiante_id: string;

  @ManyToOne(() => PeriodoAcademicoEstudiante, { nullable: true })
  @JoinColumn({ name: 'periodo_academico_estudiante_id' })
  periodo_academico_estudiante: PeriodoAcademicoEstudiante;

  // === CAMPOS LEGACY ELIMINADOS ===
  // año y semestre fueron migrados a periodo_academico (centralizado)
  // Usar periodo_academico_estudiante para acceder a esta información

  // === INFORMACIÓN DEL RAMO ===
  @Column({ type: 'int', nullable: true, default: 1 })
  oportunidad: number;

  @Column({ nullable: true, default: null })
  codigo_ramo: string;

  @Column({ nullable: true, default: null })
  nivel_educativo: string;

  @Column({ nullable: true, default: null })
  nombre_ramo: string;

  @Column({ type: 'json', nullable: true })
  notas_parciales: any;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  promedio_final: number;

  @Column({ nullable: true })
  estado: string;

  @Column({ type: 'text', nullable: true })
  comentarios: string;

  // === RELACIÓN CON ESTUDIANTE ===
  @Column({ nullable: true })
  id_estudiante: string;

  @ManyToOne(() => Estudiante, (estudiante) => estudiante.ramosCursados)
  @JoinColumn({ name: 'id_estudiante' })
  estudiante: Estudiante;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
