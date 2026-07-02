export interface JwtPayload {
  sub: string;
  rol: string;
}

export interface JwtRefreshPayload extends JwtPayload {
  tokenId: string;
}

export interface StoredRefreshToken {
  userId: string;
  tokenId: string;
}

export interface AuthenticatedUser {
  rut_usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: string;
  activo: boolean;
  must_change_password: boolean;
}

// Passport tipa `Express.User` como una interfaz vacía por defecto (ver
// @types/passport). Acá la extendemos con la forma real que le asignamos en
// JwtStrategy.validate(), así `request.user` queda tipado en todo el proyecto
// en vez de caer a `any`.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- único mecanismo de TS para hacer declaration merging con Express.Request.
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- patrón estándar de @types/passport para extender Express.User.
    interface User extends AuthenticatedUser {}
  }
}
