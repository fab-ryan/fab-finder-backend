import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, Permission, UserRole } from './entities';
import { RbacService } from './services/rbac.service';
import { RbacSeederService } from './services/rbac-seeder.service';
import { UserSeederService } from '../../seeders/user-seeder.service';
import { RoleController } from './controllers/role.controller';
import { PermissionController } from './controllers/permission.controller';
import { UserRoleController } from './controllers/user-role.controller';
import { RbacGuard } from '../../guards/rbac.guard';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission, UserRole])],
  controllers: [RoleController, PermissionController, UserRoleController],
  providers: [RbacService, RbacSeederService, UserSeederService, RbacGuard],
  exports: [RbacService, RbacSeederService, UserSeederService, RbacGuard],
})
export class RbacModule {}
