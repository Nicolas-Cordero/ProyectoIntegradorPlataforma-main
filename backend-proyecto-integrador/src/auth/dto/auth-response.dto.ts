export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: UserResponseDto;
}

export class UserResponseDto {
  rut_usuario!: string;
  nombre!: string;
  apellido!: string;
  email!: string;
  telefono!: string;
  rol!: string;
  activo!: boolean;
  must_change_password!: boolean;
}

export class TokensResponseDto {
  accessToken!: string;
  refreshToken!: string;
}

// Respuesta de login/refresh: incluye al usuario y, además, los tokens en el body
// para clientes que no usan cookies (app móvil). La web sigue usando la cookie.
export class AuthBodyResponseDto extends UserResponseDto {
  accessToken!: string;
  refreshToken!: string;
}

export class ValidateTokenResponseDto {
  valid!: boolean;
  user!: UserResponseDto;
}

export class LogoutResponseDto {
  message!: string;
}
