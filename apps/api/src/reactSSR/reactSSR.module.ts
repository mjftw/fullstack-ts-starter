import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  DynamicModule,
} from '@nestjs/common';
import { ReactSSRController } from './reactSSR.controller';
import { ReactSSRService, ReactClientPublicData } from './reactSSR.service';
import { StaticMiddleware } from './static.middleware';
import { ConfigService } from '@nestjs/config';

@Module({
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

  static register<
    E extends Record<string, unknown> = Record<string, unknown>,
  >(options: {
    /**
     * Keys of the config service that should be exposed to the client
     * as public data accessible in the browser.
     * If the ConfigService is missing any of the keys specified, and error will be thrown.
     */
    browserPublicDataConfigKeys: (keyof E & string)[];
  }): DynamicModule {
    return {
      module: ReactSSRModule,
      providers: [
        {
          provide: ReactSSRService,
          useFactory: (
            configService: ConfigService<
              E & {
                REACT_SSR_CLIENT_INDEX_HTML_PATH: string;
                REACT_SSR_SERVER_ENTRY_JS_PATH: string;
              }
            >,
          ) => {
            const clientPublicConfig =
              options.browserPublicDataConfigKeys.reduce(
                (acc, key) => {
                  acc[key] = configService.get(key, null);
                  return acc;
                },
                {} as Record<string, unknown>,
              );

            const missingKeys = options.browserPublicDataConfigKeys.filter(
              (key) => clientPublicConfig[key] === null,
            );
            if (missingKeys.length > 0) {
              throw new Error(
                `Cannot register ReactSSRModule: ConfigService is missing required keys: ${missingKeys.map((key) => `'${key}'`).join(', ')}`,
              );
            }
            return new ReactSSRService(configService, clientPublicConfig);
          },
          inject: [ConfigService],
        },
      ],
      exports: [ReactSSRService],
    };
  }
}
