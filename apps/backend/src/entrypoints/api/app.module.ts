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

import { HelloController } from '~/controllers/hello.controller';
import { UsersController } from '~/controllers/users.controller';
import { DevtoolsModule } from '@nestjs/devtools-integration';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv,
        }),
        DatabaseModule,
        RepositoriesModule,
        ServicesModule,
        // Adding the devtools module allows using NestJS Devtools in the browser.
        DevtoolsModule.register({
            http: process.env.NODE_ENV !== 'production',
            port: 5003,
          }),
    ],
    controllers: [HelloController, UsersController],
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
