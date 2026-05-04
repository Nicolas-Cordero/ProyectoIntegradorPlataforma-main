import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenService } from './services/token.service';
import { EmailService } from './services/email.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { AuthRepository } from './auth.repository';
import emailConfig from '../config/email.config';
import { RecoveryService } from './services/recovery.service';
import { UsersRepository } from '../users';

@Module({

  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule.forFeature(emailConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.access.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.access.expiresIn'),
        },
      }),
    }),
  ],

  controllers: [
    AuthController
  ],

  providers: [
    AuthService,
    TokenService,
    EmailService,
    RecoveryService,
    JwtStrategy,
    JwtRefreshStrategy,
    PrismaService,
    AuthRepository,
    UsersRepository
  ],

  exports: [
    AuthService,
    TokenService,
    JwtStrategy,
    PassportModule
  ],

})
export class AuthModule {}
