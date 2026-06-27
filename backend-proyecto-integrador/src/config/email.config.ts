import { registerAs } from '@nestjs/config';

export default registerAs('email', () => {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  const from = process.env.EMAIL_FROM;
  const fromName = process.env.EMAIL_FROM_NAME;

  if (process.env.NODE_ENV === 'production' && (!host || !user || !pass || !from || !fromName)) {
    throw new Error(
      'EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM o EMAIL_FROM_NAME no están definidos. Revisa las variables de entorno.',
    );
  }

  return {
    host: host || '',
    port: parseInt(process.env.EMAIL_PORT || '465', 10),
    secure: parseInt(process.env.EMAIL_PORT || '465', 10) === 465,
    auth: {
      user: user || '',
      pass: pass || '',
    },
    from: from || 'no-reply@example.com',
    fromName: fromName || 'Sistema de Becarios',
    resetCodeExpiration: parseInt(process.env.RESET_CODE_EXPIRATION || '15', 10),
  };
});
