import {
    MiddlewareConsumer,
    Module,
    NestModule,
    RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnv } from '~/config/environment-variables';
import { DatabaseModule } from '~/database/database.module';
import { RepositoriesModule } from '~/repository/repositories.module';
import { ServicesModule } from '~/services/services.module';
import { TrpcMiddleware } from '~/middlewares/trpc.middleware';
import { LoggerMiddleware } from '~/middlewares/logging.middleware';

// TODO: Make StaticMiddleware generic and move to middlewares dir
// Also need to fix this as currently it serves from the React SSR output dir
//  since thats what the env var used in StaticMiddleware does 
import { StaticMiddleware } from '~/middlewares/static.middleware';

@Module({
    providers: [
        {
            provide: 'STATIC_FILES_DIR',
            useFactory: (configService: ConfigService) => {
                return configService.getOrThrow<string>('REACT_STATIC_FILES_DIR');
            },
            inject: [ConfigService],
        }
    ],
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv,
        }),
        DatabaseModule,
        RepositoriesModule,
        ServicesModule,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(LoggerMiddleware)
            .forRoutes({ path: '*', method: RequestMethod.ALL });

        consumer
            .apply(TrpcMiddleware)
            .forRoutes({ path: 'trpc/*', method: RequestMethod.ALL });
    
        consumer
            .apply(StaticMiddleware)
            .forRoutes({ path: '*', method: RequestMethod.ALL });
    }
}
