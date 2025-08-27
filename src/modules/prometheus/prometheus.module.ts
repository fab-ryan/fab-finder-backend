import { Module, Global } from '@nestjs/common';
import { PrometheusService } from './prometheus.service';
import { PrometheusController } from './prometheus.controller';
import { PrometheusMiddleware } from './prometheus.middleware';
import { PrometheusModule as PrometheusModules } from '@willsoto/nestjs-prometheus';

@Global()
@Module({
  imports: [
    PrometheusModules.register({
      defaultMetrics: {
        enabled: true,
      },
      global: true,
    }),
  ],
  controllers: [PrometheusController],
  providers: [PrometheusService, PrometheusMiddleware],
  exports: [PrometheusService, PrometheusMiddleware],
})
export class PrometheusModule {}
