import { Module } from '@nestjs/common';
import { ShareModule } from '@/common/modules/share.module';
import { SetupModule } from './modules/setup/setup.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { UsersModule } from './modules/users/users.module';
import { PrometheusModule } from './modules/prometheus';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ShareModule,
    PrometheusModule,
    SetupModule,
    RbacModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
