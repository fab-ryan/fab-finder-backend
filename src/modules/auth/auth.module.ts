import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '@/common/strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { config } from '@/configs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { GoogleStrategy } from '@/common/strategy/google.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: config().secret,
      signOptions: { expiresIn: '1d' },
      global: true,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
