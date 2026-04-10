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

@Entity('informacion_contacto')
export class InformacionContacto {
  @PrimaryColumn('uuid')
  id_informacion_contacto: string;

  @BeforeInsert()
  generateId() {
    this.id_informacion_contacto = uuidv4();
  }

  @Column({ type: 'uuid', unique: true })
  estudiante_id: string;

  @OneToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ nullable: true })
  telefono: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  direccion: string;

  @Column({ nullable: true })
  comuna: string;

  @Column({ nullable: true })
  region: string;

  @UpdateDateColumn()
  updated_at: Date;
}
