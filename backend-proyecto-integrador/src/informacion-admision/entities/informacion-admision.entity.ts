import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Estudiante } from '../../estudiante/entities/estudiante.entity';
import { EnsayoPaes } from './ensayo-paes.entity';

@Entity('informacion_admision')
export class InformacionAdmision {
  @PrimaryColumn('uuid')
  id_informacion_admision: string;

  @BeforeInsert()
  generateId() {
    this.id_informacion_admision = uuidv4();
  }

  @Column({ type: 'uuid', unique: true })
  estudiante_id: string;

  @OneToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ nullable: true })
  via_acceso: string;

  @Column({ type: 'int', nullable: true })
  año_ingreso: number;

  @Column({ nullable: true })
  colegio: string;

  @Column({ nullable: true })
  especialidad_colegio: string;

  @Column({ nullable: true })
  comuna_colegio: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  puntaje_nem: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  puntaje_ranking: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  puntaje_lenguaje: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  puntaje_matematicas: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  puntaje_ciencias: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  puntaje_historia: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  puntaje_ponderado: number;

  @Column({ type: 'jsonb', nullable: true })
  otros_puntajes: any;

  @OneToMany(() => EnsayoPaes, (ensayo) => ensayo.admision)
  ensayos_paes: EnsayoPaes[];

  @CreateDateColumn()
  created_at: Date;
}
