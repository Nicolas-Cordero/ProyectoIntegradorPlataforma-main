export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: UserResponseDto;
}

export class UserResponseDto {
  rut_usuario!: string;
  nombre!: string;
  apellido!: string
  email!: string;
  telefono!: string
  rol!: string;
}

export class TokensResponseDto {
  accessToken!: string;
  refreshToken!: string;
}

export class ValidateTokenResponseDto {
  valid!: boolean;
  user!: {
    rut_usuario: string;
    nombre: string;
    apellido: string
    email: string;
    telefono: string
    rol: string;
  };
}

export class LogoutResponseDto {
  message!: string;
}
