import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from '../users/entities/user.entity';
import { UserRole } from '../rbac/entities/user-role.entity';
import { Role } from '../rbac/entities/role.entity';
import {
  CreateUserDto,
  UpdateUserStatusDto,
  UserFilterDto,
} from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async createUser(
    createUserDto: CreateUserDto,
    createdBy?: string,
  ): Promise<User> {
    const { email, username, password, roles, ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new BadRequestException(
        'User with this email or username already exists',
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      ...userData,
      email,
      username,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
    });

    const savedUser = await this.userRepository.save(user);

    // Assign roles if provided
    if (roles && roles.length > 0) {
      await this.assignRolesToUser(savedUser.id, roles);
    } else {
      // Assign default 'user' role
      await this.assignRolesToUser(savedUser.id, ['user']);
    }

    return this.findUserById(savedUser.id);
  }

  async findAllUsers(
    filterDto: UserFilterDto,
  ): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const { search, status, role, page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply status filter
    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    // Apply role filter
    if (role) {
      queryBuilder.andWhere('role.name = :role', { role });
    }

    queryBuilder.orderBy('user.createdAt', 'DESC').skip(skip).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      users,
      total,
      page,
      limit,
    };
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role', 'userRoles.role.permissions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['userRoles', 'userRoles.role', 'userRoles.role.permissions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserStatus(
    id: string,
    updateStatusDto: UpdateUserStatusDto,
    updatedBy?: string,
  ): Promise<User> {
    const user = await this.findUserById(id);

    // Prevent modifying admin users
    const isAdmin = user.userRoles.some((ur) => ur.role.name === 'admin');
    if (isAdmin && updateStatusDto.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('Cannot disable or ban admin users');
    }

    user.status = updateStatusDto.status;

    // Handle ban status
    if (updateStatusDto.status === UserStatus.BANNED) {
      user.bannedAt = new Date();
      user.bannedReason = updateStatusDto.reason || 'No reason provided';
      user.bannedBy = updatedBy;
    } else if (user.status !== UserStatus.BANNED) {
      // Clear ban info if status is not banned
      user.bannedAt = null;
      user.bannedReason = null;
      user.bannedBy = null;
    }

    return this.userRepository.save(user);
  }

  async disableUser(
    id: string,
    reason?: string,
    disabledBy?: string,
  ): Promise<User> {
    return this.updateUserStatus(
      id,
      { status: UserStatus.INACTIVE, reason },
      disabledBy,
    );
  }

  async enableUser(id: string): Promise<User> {
    return this.updateUserStatus(id, { status: UserStatus.ACTIVE });
  }

  async banUser(id: string, reason: string, bannedBy?: string): Promise<User> {
    return this.updateUserStatus(
      id,
      { status: UserStatus.BANNED, reason },
      bannedBy,
    );
  }

  async unbanUser(id: string): Promise<User> {
    return this.updateUserStatus(id, { status: UserStatus.ACTIVE });
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.findUserById(id);

    // Prevent deleting admin users
    const isAdmin = user.userRoles.some((ur) => ur.role.name === 'admin');
    if (isAdmin) {
      throw new BadRequestException('Cannot delete admin users');
    }

    // Remove user roles first
    await this.userRoleRepository.delete({ userId: id });

    // Delete user
    await this.userRepository.delete(id);
  }

  private async assignRolesToUser(
    userId: string,
    roleNames: string[],
  ): Promise<void> {
    // Find roles
    const roles = await this.roleRepository.find({
      where: { name: In(roleNames) },
    });

    if (roles.length !== roleNames.length) {
      throw new BadRequestException('One or more roles not found');
    }

    // Create user role assignments
    const userRoles = roles.map((role) =>
      this.userRoleRepository.create({
        userId,
        roleId: role.id,
        isActive: true,
      }),
    );

    await this.userRoleRepository.save(userRoles);
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    banned: number;
    verified: number;
  }> {
    const [total, active, inactive, banned, verified] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { status: UserStatus.ACTIVE } }),
      this.userRepository.count({ where: { status: UserStatus.INACTIVE } }),
      this.userRepository.count({ where: { status: UserStatus.BANNED } }),
      this.userRepository.count({ where: { isVerified: true } }),
    ]);

    return {
      total,
      active,
      inactive,
      banned,
      verified,
    };
  }
}
