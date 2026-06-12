import { registerAs } from '@nestjs/config';

export default registerAs('email', () => {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (process.env.NODE_ENV === 'production' && (!host || !user || !pass)) {
    throw new Error(
      'EMAIL_HOST, EMAIL_USER o EMAIL_PASSWORD no están definidos. Revisa las variables de entorno.',
    );
  }

  return {
    host: host || '',
    port: parseInt(process.env.EMAIL_PORT || '2525', 10),
    auth: {
      user: user || '',
      pass: pass || '',
    },
    from: `Sistema de Becarios <${user}>`,
    resetCodeExpiration: parseInt(process.env.RESET_CODE_EXPIRATION || '15', 10),
  };
});
