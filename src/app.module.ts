import { Module } from '@nestjs/common';
import { ShareModule } from '@/common/modules/share.module';
import { SetupModule } from './modules/setup/setup.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { UsersModule } from './modules/users/users.module';
import { PrometheusModule } from './modules/prometheus';
import { AuthModule } from './modules/auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ShareModule,
    PrometheusModule,
    SetupModule,
    RbacModule,
    UsersModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
    }),
  ],
})
export class AppModule {}
