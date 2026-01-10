import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { config } from '@/configs';
import { User } from '../../modules/users/entities/user.entity';
import { AuthenticatedUser } from '../../types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config().secret.toString(),
    });
  }

  async validate(payload: any): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findOne({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: { id: payload.sub },
      relations: ['userRoles', 'userRoles.role', 'userRoles.role.permissions'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is not active');
    }

    // Extract roles and permissions
    const roles =
      user.userRoles
        ?.filter((userRole) => userRole.isActive)
        .map((userRole) => userRole.role.name) || [];

    const permissions =
      user.userRoles
        ?.filter((userRole) => userRole.isActive)
        .flatMap((userRole) =>
          userRole.role.permissions
            ?.filter((permission) => permission.isActive)
            .map((permission) => `${permission.resource}:${permission.action}`),
        ) || [];

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      roles,
      permissions: [...new Set(permissions)], // Remove duplicates
    };
  }
}
