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
  ) {}

  async create(createAuthDto: CreateAuthDto) {
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

  // Placeholder methods for other endpoints
  loginWithGoogle() {
    return {
      code: 200,
      message: 'Google login not implemented yet',
    };
  }

  googleLogin(req: any) {
    throw new BadRequestException('Google login not implemented yet');
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
}
