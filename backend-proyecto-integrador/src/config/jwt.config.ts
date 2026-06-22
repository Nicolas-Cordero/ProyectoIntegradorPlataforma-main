import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no está definido. Revisa las variables de entorno.');

  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!refreshSecret) throw new Error('JWT_REFRESH_SECRET no está definido. Revisa las variables de entorno.');

  return {
    access: {
      secret,
      expiresIn: process.env.JWT_EXPIRATION || '15m',
    },
    refresh: {
      secret: refreshSecret,
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
      expiresInMobile: process.env.JWT_REFRESH_EXPIRATION_MOBILE || '90d',
    },
  };
});
