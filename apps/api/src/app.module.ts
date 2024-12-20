import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './controllers/app.controller';
import { AppService } from './app.service';
import { validateEnv } from './config/environment-variables';
import { DatabaseModule } from './persistence/database.module';
import { RepositoriesModule } from './repository/repositories.module';
import { UsersController } from './controllers/users.controller';
import { ServicesModule } from './services/services.module';
import { TrpcMiddleware } from './middlewares/trpc.middleware';
import { LoggerMiddleware } from './middlewares/logging.middleware';

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
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL })
      .apply(TrpcMiddleware)
      .forRoutes({ path: 'trpc/*', method: RequestMethod.ALL });
  }
}
