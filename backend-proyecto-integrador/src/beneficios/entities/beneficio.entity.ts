import {
  Entity,
  PrimaryColumn,
  Column,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export enum TipoBeneficio {
  BECA = 'BECA',
  CREDITO = 'CREDITO',
  GRATUIDAD = 'GRATUIDAD',
  BENEFICIO_ESTATAL = 'BENEFICIO_ESTATAL',
}

@Entity('beneficio')
export class Beneficio {
  @PrimaryColumn('uuid')
  id_beneficio: string;

  @BeforeInsert()
  generateId() {
    this.id_beneficio = uuidv4();
  }

  @Column({ unique: true })
  nombre: string;

  @Column({ unique: true })
  codigo: string;

  @Column({
    type: 'enum',
    enum: TipoBeneficio,
    nullable: true,
  })
  tipo: TipoBeneficio;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;
}
