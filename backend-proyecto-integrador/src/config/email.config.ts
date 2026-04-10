import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.EMAIL_HOST || '',
  port: parseInt(process.env.EMAIL_PORT || '', 10),
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '', 
  },
  from: `Sistema de Becarios <${process.env.EMAIL_USER}>`,
  resetCodeExpiration: parseInt(process.env.RESET_CODE_EXPIRATION || '15', 10),
}));