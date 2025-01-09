
import {
    MiddlewareConsumer,
    Module,
    NestModule,
    RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
    validateEnv,
} from '~/config/environment-variables';
import { DatabaseModule } from '~/database/database.module';
import { RepositoriesModule } from '~/repository/repositories.module';
import { ServicesModule } from '~/services/services.module';
import { TrpcMiddleware } from '~/middlewares/trpc.middleware';
import { LoggerMiddleware } from '~/middlewares/logging.middleware';

@Module({
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
    }
}
