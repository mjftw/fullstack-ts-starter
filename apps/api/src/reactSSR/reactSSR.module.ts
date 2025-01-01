import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ReactSSRController } from './reactSSR.controller';
import { ReactSSRService } from './reactSSR.service';
import { StaticMiddleware } from './static.middleware';

@Module({
  providers: [ReactSSRService],
  exports: [ReactSSRService],
  controllers: [ReactSSRController],
})
export class ReactSSRModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(StaticMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.GET });
  }
}
