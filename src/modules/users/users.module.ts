import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole, Role } from '../rbac/entities';
import { User } from './entities/user.entity';
import { RbacModule } from '../rbac';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole, Role]), RbacModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
