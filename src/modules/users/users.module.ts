import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole, Role } from '../rbac/entities';
import { User } from './entities/user.entity';
import { RbacModule } from '../rbac';
import { Session } from './entities/session.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole, Role, Session]),
    RbacModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
