import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './controllers/app.controller';
import { AppService } from './app.service';
import { validationSchemaForEnv } from './config/environment-variables';
import { PersistenceModule } from './persistence/persistence.module';
import { RepositoriesModule } from './repository/repositories.module';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: validationSchemaForEnv,
    }),
    PersistenceModule,
    RepositoriesModule,
  ],
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule {}
