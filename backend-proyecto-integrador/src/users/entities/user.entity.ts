import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export enum UserRole {
  ADMIN = 'admin',
  TUTOR = 'tutor',
  VISITA = 'visita',
}

@Entity('users')
@Unique(['email', 'username'])
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ default: true })
  activo: boolean;
  
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VISITA,
  })
  rol: UserRole;

  @Column({ nullable: true, type: 'timestamp' })
  ultimo_login: Date | null;

  @Column({ nullable: true, type: 'text' })
  refreshToken: string | null;

  @Column({ nullable: true, type: 'varchar', length: 6 })
  resetPasswordCode: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  resetPasswordExpires: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
