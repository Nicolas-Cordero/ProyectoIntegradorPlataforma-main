export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
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
  id: string;
  username: string;
  email: string;
  rol: string;
  nombre: string;
  apellido: string;
}
