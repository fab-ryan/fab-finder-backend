import { Module } from '@nestjs/common';
import { ShareModule } from '@/common/modules/share.module';
import { SetupModule } from './modules/setup/setup.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [ShareModule, SetupModule, RbacModule, UsersModule],
})
export class AppModule {}
