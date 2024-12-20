import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TrpcMiddleware } from './trpc.middleware';
import { ServicesModule } from 'src/services/services.module';

@Module({
  imports: [ServicesModule],
})
export class TrpcModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TrpcMiddleware)
      .forRoutes({ path: 'trpc', method: RequestMethod.ALL });
  }
}
