import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Role } from '../modules/rbac/entities/role.entity';
import { UserRole } from '../modules/rbac/entities/user-role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSeederService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  async seedDefaultAdmin(): Promise<void> {
    const adminRole = await this.roleRepository.findOne({
      where: { name: 'admin' },
    });

    if (!adminRole) {
      throw new Error('Admin role not found. Please seed roles first.');
    }

    // Check if admin user already exists
    const existingAdmin = await this.userRepository.findOne({
      where: { email: 'admin@fab-finder.com' },
    });

    if (!existingAdmin) {
      // Create default admin user
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const adminUser = this.userRepository.create({
        email: 'admin@fab-finder.com',
        username: 'admin',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        password: hashedPassword,
        isActive: true,
        isVerified: true,
      });

      const savedUser = await this.userRepository.save(adminUser);

      // Assign admin role to user
      const userRole = this.userRoleRepository.create({
        userId: savedUser.id,
        roleId: adminRole.id,
      });

      await this.userRoleRepository.save(userRole);

      console.log('Default admin user created successfully');
      console.log('Email: admin@fab-finder.com');
      console.log('Password: admin123');
      console.log('⚠️  Please change the default password after first login!');
    } else {
      console.log('Default admin user already exists');
    }
  }

  async seedTestUsers(): Promise<void> {
    const roles = await this.roleRepository.find({
      where: [
        { name: 'manager' },
        { name: 'editor' },
        { name: 'viewer' },
        { name: 'user' },
      ],
    });

    const testUsers = [
      {
        email: 'manager@fab-finder.com',
        username: 'manager',
        firstName: 'Test',
        lastName: 'Manager',
        roleName: 'manager',
      },
      {
        email: 'editor@fab-finder.com',
        username: 'editor',
        firstName: 'Test',
        lastName: 'Editor',
        roleName: 'editor',
      },
      {
        email: 'viewer@fab-finder.com',
        username: 'viewer',
        firstName: 'Test',
        lastName: 'Viewer',
        roleName: 'viewer',
      },
      {
        email: 'user@fab-finder.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        roleName: 'user',
      },
    ];

    for (const userData of testUsers) {
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email },
      });

      if (!existingUser) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const hashedPassword = await bcrypt.hash('test123', 10);

        const user = this.userRepository.create({
          email: userData.email,
          username: userData.username,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          password: hashedPassword,
          isActive: true,
          isVerified: true,
        });

        const savedUser = await this.userRepository.save(user);

        // Find and assign role
        const role = roles.find((r) => r.name === userData.roleName);
        if (role) {
          const userRole = this.userRoleRepository.create({
            userId: savedUser.id,
            roleId: role.id,
          });

          await this.userRoleRepository.save(userRole);
          console.log(
            `Created test user: ${userData.email} with role: ${userData.roleName}`,
          );
        }
      } else {
        console.log(`Test user already exists: ${userData.email}`);
      }
    }
  }

  async removeTestUsers(): Promise<void> {
    const testEmails = [
      'manager@fab-finder.com',
      'editor@fab-finder.com',
      'viewer@fab-finder.com',
      'user@fab-finder.com',
    ];

    for (const email of testEmails) {
      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (user) {
        // Remove user roles first
        await this.userRoleRepository.delete({ userId: user.id });
        // Remove user
        await this.userRepository.delete(user.id);
        console.log(`Removed test user: ${email}`);
      }
    }
  }
}
