import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
    validateEnv,
} from '~/config/environment-variables';
import { DatabaseModule } from '~/database/database.module';
import { RepositoriesModule } from '~/repository/repositories.module';
import { ServicesModule } from '~/services/services.module';
import { ConsumerModule } from '~/events/consume/consumer.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv,
        }),
        DatabaseModule,
        RepositoriesModule,
        ServicesModule,
        ConsumerModule,
    ],
})
export class AppModule { }

