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
  // FIXME: Currently we have an issue where the static files middleware and the react SSR controller
  // are both listening to the same path.
  // This works okay since the ReactSSRController takes priority, but it's not a clean solution.
  // Also if the rendering the app fails, the static files middleware is be used instead.
  // This is very confusing as the static files middleware then picks up the index.html file
  // and serves it statically, without replacing the app content in the document, giving what appears
  // to be a correct render, but with a blank page.
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(StaticMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.GET });
  }
}
