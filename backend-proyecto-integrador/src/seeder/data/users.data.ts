import { UserRole } from "../../users";

export const usersData = [
  {
    username: 'admin',
    email: 'admin@fundacion.cl',
    password: 'admin123',
    nombre: 'Administrador',
    apellido: 'Sistema',
    rol: UserRole.ADMIN,
    activo: true,
  },
];
