import { Entity, PrimaryColumn, Column, OneToMany, BeforeInsert } from 'typeorm';
import { Estudiante } from '../../estudiante/entities/estudiante.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('institucion')
export class Institucion {
  @PrimaryColumn('uuid')
  id_institucion: string;

  @BeforeInsert()
  generateId() {
    this.id_institucion = uuidv4();
  }

  @Column({ nullable: true, default: null })
  nombre: string;

  @Column({ nullable: true, default: null })
  tipo_institucion: string;

  @Column({ nullable: true, default: null })
  nivel_educativo: string;
  
  @Column({ nullable: true, default: null })
  carrera_especialidad: string;

  @Column({ nullable: true, default: null })
  duracion: string;

  @Column({ nullable: true, default: null })
  anio_de_ingreso: string;

  @Column({ nullable: true, default: null })
  anio_de_egreso: string;

  @OneToMany(() => Estudiante, (estudiante) => estudiante.institucion)
  estudiantes: Estudiante[];
}
