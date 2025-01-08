import {
    MiddlewareConsumer,
    Module,
    NestModule,
    RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
    EnvironmentVariables,
    validateEnv,
} from '~/config/environment-variables';
import { DatabaseModule } from '~/database/database.module';
import { RepositoriesModule } from '~/repository/repositories.module';
import { ServicesModule } from '~/services/services.module';
import { TrpcMiddleware } from '~/middlewares/trpc.middleware';
import { LoggerMiddleware } from '~/middlewares/logging.middleware';
import { ReactSSRModule } from '~/reactSSR/reactSSR.module';
import { ReactSSRController } from '~/reactSSR/reactSSR.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv,
        }),
        DatabaseModule,
        RepositoriesModule,
        ServicesModule,
        // Passing in the EnvironmentVariables type to the ReactSSRModule.register function
        // so that we can type check the config service keys.
        ReactSSRModule.register<EnvironmentVariables>({
            browserPublicDataConfigKeys: ['FOO', 'BAR'],
        }),
    ],
    controllers: [ReactSSRController],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(LoggerMiddleware)
            .forRoutes({ path: '*', method: RequestMethod.ALL });

        consumer
            .apply(TrpcMiddleware)
            .forRoutes({ path: 'trpc/*', method: RequestMethod.ALL });
    }
}
