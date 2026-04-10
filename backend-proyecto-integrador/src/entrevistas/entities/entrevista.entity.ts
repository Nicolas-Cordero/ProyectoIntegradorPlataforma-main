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
} from 'typeorm';
import { Estudiante } from '../../estudiante/entities/estudiante.entity';
import { User } from '../../users/entities/user.entity';
import { Texto } from './texto.entity';
import { v4 as uuidv4 } from 'uuid';

export enum EstadoEntrevista {
  PROGRAMADA = 'programada',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
  REPROGRAMADA = 'reprogramada',
}

@Entity('entrevista')
export class Entrevista {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }

  @ManyToOne(() => Estudiante, (estudiante) => estudiante.entrevistas, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_estudiante' })
  estudiante: Estudiante;

  @Column({ name: 'id_estudiante' })
  estudianteId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'id_usuario' })
  usuario: User;

  @Column({ name: 'id_usuario' })
  usuarioId: string;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @Column({ name: 'nombre_tutor' })
  nombre_Tutor: string;

  @Column({ type: 'int' })
  año: number;

  @Column({ name: 'numero_entrevista', type: 'int' })
  numero_Entrevista: number;

  @Column({ name: 'duracion_minutos', type: 'int' })
  duracion_minutos: number;

  @Column({
    type: 'enum',
    enum: EstadoEntrevista,
    default: EstadoEntrevista.PROGRAMADA,
  })
  estado: EstadoEntrevista;

  @Column({ type: 'text', nullable: true, default: '' })
  observaciones: string | null;

  @Column({ type: 'text', nullable: true, default: '' })
  informacion_adicional: string | null;

  @Column({ name: 'temas_abordados', type: 'simple-array' })
  temas_abordados: string[];

  @OneToMany(() => Texto, (texto) => texto.entrevista, {
    cascade: true,
    eager: true,
  })
  textos: Texto[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
