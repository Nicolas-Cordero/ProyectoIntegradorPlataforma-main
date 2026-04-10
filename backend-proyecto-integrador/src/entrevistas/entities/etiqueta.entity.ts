import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('etiqueta')
export class Etiqueta {
  @PrimaryColumn({ name: 'nombre_etiqueta', type: 'varchar' })
  nombre_etiqueta: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
