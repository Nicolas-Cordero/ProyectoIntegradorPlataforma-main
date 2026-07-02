import { UserRol } from '@prisma/client';

export const usersData = [
  {
    rut_usuario: '12345678-9',
    nombre: 'admin',
    apellido: 'admin',
    email: 'admin@fundacion.cl',
    telefono: '+56912345678',
    rol: UserRol.ADMIN,
    password: 'admin123',
  },
  {
    rut_usuario: '12345678-1',
    nombre: 'admin',
    apellido: 'admin',
    email: 'nabil@fundacion.cl',
    telefono: '+56912345678',
    rol: UserRol.ADMIN,
    password: 'admin123',
  },
  {
    rut_usuario: '98765432-1',
    nombre: 'visita',
    apellido: 'visita',
    email: 'visita@fundacion.cl',
    telefono: '+56987654321',
    rol: UserRol.VISITA,
    password: 'visita123',
  },
  {
    rut_usuario: '11223344-5',
    nombre: 'tutor',
    apellido: 'tutor',
    email: 'tutor@fundacion.cl',
    telefono: '+56911223344',
    rol: UserRol.TUTOR,
    password: 'tutor123',
  },
  {
    rut_usuario: '55667788-9',
    nombre: 'estudiante',
    apellido: 'estudiante',
    email: 'estudiante@fundacion.cl',
    telefono: '+56944332211',
    rol: UserRol.ESTUDIANTE,
    password: 'estudiante123',
  },
];
