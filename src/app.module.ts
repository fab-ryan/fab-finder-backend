import { Module } from '@nestjs/common';
import { ShareModule } from '@/common/modules/share.module';
@Module({
  imports: [ShareModule],
})
export class AppModule {}
