import { Module } from '@nestjs/common';
import { SetupController } from './setup.controller';
import { SetupService } from './setup.service';
import { RbacModule } from '../rbac/rbac.module';
import { UsersModule } from '../users';

@Module({
  imports: [RbacModule, UsersModule],
  controllers: [SetupController],
  providers: [SetupService],
})
export class SetupModule {}
