import { Logger, Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { ConfigService } from '@nestjs/config';
import { createConsumerConfig } from './config';
import { Services, ServicesModule } from '~/services/services.module';
import { Logger as MVLogger } from '@multiverse-io/logger';
import { HelloService } from '~/services/hello.service';
import { UserService } from '~/services/user.service';

@Module({
  imports: [ServicesModule],
  providers: [ConsumerService,
    {
      provide: 'CONSUMER_CONFIG',
      useFactory: (configService: ConfigService, helloService: HelloService, userService: UserService) => {
        const env = {
          ENVIRONMENT: configService.getOrThrow('ENVIRONMENT'),
          RABBITMQ_HOST: configService.getOrThrow('RABBITMQ_HOST'),
          RABBITMQ_PORT: configService.getOrThrow('RABBITMQ_PORT'),
          RABBITMQ_USERNAME: configService.getOrThrow('RABBITMQ_USERNAME'),
          RABBITMQ_PASSWORD: configService.getOrThrow('RABBITMQ_PASSWORD'),
          RABBITMQ_REQUIRE_TLS: configService.getOrThrow('RABBITMQ_REQUIRE_TLS'),
          RABBITMQ_CREATE_CONSUMER_EXCHANGES: configService.getOrThrow('RABBITMQ_CREATE_CONSUMER_EXCHANGES'),
        };
        const logger = new Logger(ConsumerService.name);
        const mvLogger: MVLogger = {
          debug: (message) => logger.debug(message),
          info: (message) => logger.log(message),
          warn: (message, meta) => logger.warn(message, meta),
          error: (message, meta) => logger.error(message, meta),
        }
        return createConsumerConfig({ env, ctx: { services: { helloService, userService }, logger: mvLogger }, logger: mvLogger });
      },
      inject: [ConfigService, HelloService, UserService],
    },
  ],
  exports: [ConsumerService],
})
export class ConsumerModule { }
