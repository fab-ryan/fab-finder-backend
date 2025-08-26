import { Global, Module } from '@nestjs/common';
import { DbModule } from '@/configs/db.module';

@Global()
@Module({
  imports: [DbModule],
  exports: [DbModule],
})
export class ShareModule {}
