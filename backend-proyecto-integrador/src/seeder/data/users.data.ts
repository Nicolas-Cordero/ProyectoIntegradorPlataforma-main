import { UserRol } from '@prisma/client';

export const usersData = [
  {
    rut_usuario: '15342892-1',
    nombre: 'Max',
    apellido: 'Ropert Rossel',
    email: 'm.ropert@fundacioncarmengoudie.cl',
    telefono: '+56994930409',
    rol: UserRol.ADMIN,
    password: '15342892',
  },
  {
    rut_usuario: '6871149-5',
    nombre: 'Pablo',
    apellido: 'Valdivieso Tocornal',
    email: 'p.valdivieso@fundacioncarmengoudie.cl',
    telefono: '+56997682818',
    rol: UserRol.VISITA,
    password: '6871149',
  },
  {
    rut_usuario: '20728083-6',
    nombre: 'Mónica',
    apellido: 'Cordovez Ángel',
    email: 'm.cordovez@fundacioncarmengoudie.cl',
    telefono: '+56930545586',
    rol: UserRol.TUTOR,
    password: '20728083',
  },
  {
    rut_usuario: '11111111-1',
    nombre: 'BrainStack',
    apellido: 'Team',
    email: 'nabilhaddad236@gmail.com',
    telefono: '+56966535791',
    rol: UserRol.ADMIN,
    password: 'admin123',
  },
];
