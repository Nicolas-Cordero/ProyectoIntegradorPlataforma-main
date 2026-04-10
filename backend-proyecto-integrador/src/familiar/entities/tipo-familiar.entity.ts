import {
  Entity,
  PrimaryColumn,
  Column,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export enum TipoFamiliarCodigo {
  MADRE = 'MADRE',
  PADRE = 'PADRE',
  HERMANO = 'HERMANO',
  ABUELO = 'ABUELO',
  TIO = 'TIO',
  OTRO = 'OTRO',
}

@Entity('tipo_familiar')
export class TipoFamiliar {
  @PrimaryColumn('uuid')
  id_tipo_familiar: string;

  @BeforeInsert()
  generateId() {
    this.id_tipo_familiar = uuidv4();
  }

  @Column({ unique: true })
  nombre: string;

  @Column({
    type: 'enum',
    enum: TipoFamiliarCodigo,
    unique: true,
  })
  codigo: TipoFamiliarCodigo;

  @Column({ type: 'int', default: 0 })
  orden: number;
}
