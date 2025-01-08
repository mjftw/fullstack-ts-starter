import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  DynamicModule,
  Inject,
} from '@nestjs/common';
import { ReactSSRController } from './reactSSR.controller';
import { ReactSSRService } from './reactSSR.service';
import { StaticMiddleware } from '../middlewares/static.middleware';
import { ConfigService } from '@nestjs/config';

@Module({})
export class ReactSSRModule implements NestModule {

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
        {
          provide: 'STATIC_FILES_DIR',
          useFactory: (configService: ConfigService) => {
            return configService.getOrThrow<string>('REACT_SSR_CLIENT_STATIC_DIR');
          },
          inject: [ConfigService],
        }
      ],
      controllers: [ReactSSRController],
      exports: [ReactSSRService],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(StaticMiddleware)
      .forRoutes({ path: '*.*', method: RequestMethod.GET });
  }
}
