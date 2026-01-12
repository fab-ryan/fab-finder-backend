/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Session } from '../users/entities/session.entity';
import { Request } from 'express';
interface TokenPayload {
  sub: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async create(createAuthDto: CreateAuthDto, req: Request) {
    try {
      const { username, password } = createAuthDto;

      // Find user by email or username
      const user = await this.userRepository.findOne({
        where: [{ email: username }, { username: username }],
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check password
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException('Account is not active');
      }

      // Generate JWT token
      const payload = { sub: user.id };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
      await this.saveUserSession(
        user.id,
        refreshToken,
        req.headers['user-agent'],
        req.ip,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      );

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Login failed');
    }
  }

  async renewToken(token: string) {
    try {
      const payload: TokenPayload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      const newAccessToken = this.jwtService.sign({ sub: user.id });
      const newRefreshToken = this.jwtService.sign(
        { sub: user.id },
        { expiresIn: '7d' },
      );

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      throw new BadRequestException('Token renewal failed');
    }
  }

  loginWithGoogle() {
    return {
      code: 200,
      message: 'Google login not implemented yet',
    };
  }

  async googleLogin(req: any) {
    try {
      if (!req.user) {
        throw new BadRequestException('No user from Google');
      }

      const { email, firstName, lastName, picture } = req.user;

      // Check if user exists
      let user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        user = this.userRepository.create({
          email,
          isActive: true,
          username: email.split('@')[0], // Create username from email
          password: '', // No password for OAuth users
          lastName,
          firstName,
          profilePicture: picture,
          isVerified: true,
        });

        await this.userRepository.save(user);
      }

      // Generate JWT token
      const payload = { sub: user.id };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
      await this.saveUserSession(
        user.id,
        refreshToken,
        req.headers['user-agent'],
        req.ip,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      );
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      };
    } catch (error) {
      throw new BadRequestException(
        'Google authentication failed: ' + error.message,
      );
    }
  }

  forgotPassword(passwordDto: any) {
    throw new BadRequestException('Forgot password not implemented yet');
  }

  verifyOtp(otp: any, token: string) {
    throw new BadRequestException('OTP verification not implemented yet');
  }

  resetPassword(payload: any, token: string) {
    throw new BadRequestException('Password reset not implemented yet');
  }

  async saveUserSession(
    $userId: string,
    refreshToken: string,
    userAgent: string,
    ipAddress: string,
    expiresAt: Date,
  ) {
    const session = this.sessionRepository.create({
      userId: $userId,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt,
    });
    await this.sessionRepository.save(session);
  }

  async userSessions(userId: string) {
    const sessions = await this.sessionRepository.find({ where: { userId } });
    return sessions;
  }
}
