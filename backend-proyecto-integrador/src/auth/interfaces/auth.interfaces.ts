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
  apellido: string
  email: string;
  telefono: string
  rol: string;
  activo: boolean;
  must_change_password: boolean;
}