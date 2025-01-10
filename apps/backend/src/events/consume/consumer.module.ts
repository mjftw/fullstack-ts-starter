import { Logger, Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { ConfigService } from '@nestjs/config';
import { createConsumerConfig } from './config';
import { ServicesModule } from '~/services/services.module';
import { Logger as MVLogger } from '@multiverse-io/logger';
import { HelloService } from '~/services/hello.service';
import { UserService } from '~/services/user.service';

@Module({
  imports: [ServicesModule],
  providers: [ConsumerService,
    {
      provide: 'MV_LOGGER',
      useFactory: () => {
        const logger = new Logger(ConsumerService.name);
        const mvLogger: MVLogger = {
          debug: (message) => logger.debug(message),
          info: (message) => logger.log(message),
          warn: (message, meta) => logger.warn(message, meta),
          error: (message, meta) => logger.error(message, meta),
        }
        return mvLogger;
      }
    },
    {
      provide: 'CONSUMER_CTX',
      useFactory: (configService: ConfigService, helloService: HelloService, userService: UserService, mvLogger: MVLogger) => {
        return { services: { helloService, userService }, logger: mvLogger };
      },
      inject: [ConfigService, HelloService, UserService, 'MV_LOGGER'],
    },
    {
      provide: 'CONSUMER_CONFIG',
      useFactory: (configService: ConfigService, mvLogger: MVLogger) => {
        const env = {
          ENVIRONMENT: configService.getOrThrow('ENVIRONMENT'),
          RABBITMQ_HOST: configService.getOrThrow('RABBITMQ_HOST'),
          RABBITMQ_PORT: configService.getOrThrow('RABBITMQ_PORT'),
          RABBITMQ_USERNAME: configService.getOrThrow('RABBITMQ_USERNAME'),
          RABBITMQ_PASSWORD: configService.getOrThrow('RABBITMQ_PASSWORD'),
          RABBITMQ_REQUIRE_TLS: configService.getOrThrow('RABBITMQ_REQUIRE_TLS'),
          RABBITMQ_CREATE_CONSUMER_EXCHANGES: configService.getOrThrow('RABBITMQ_CREATE_CONSUMER_EXCHANGES'),
        };
        return createConsumerConfig({ env, logger: mvLogger });
      },
      inject: [ConfigService, 'MV_LOGGER'],
    },
  ],
  exports: [ConsumerService],
})
export class ConsumerModule { }
