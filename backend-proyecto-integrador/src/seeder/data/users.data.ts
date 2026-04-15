import { UserRole } from "../../users";

export const usersData = [
  {
    username: 'admin',
    email: 'admin@admin.cl',
    password: 'admin123',
    nombre: 'Administrador',
    apellido: 'Sistema',
    rol: UserRole.ADMIN,
    activo: true,
  },
];
