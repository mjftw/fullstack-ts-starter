import { createRabbitMQConsumers, RabbitMQConsumersConfig } from '@multiverse-io/events-tooling-ts';
import { Inject, Injectable, Logger, OnApplicationShutdown, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly logger = new Logger(ConsumerService.name);
  private app: INestApplication | null = null;
  private stopConsumers: Awaited<ReturnType<typeof createRabbitMQConsumers>> | null = null;

  constructor(
    @Inject('CONSUMER_CONFIG') private readonly consumerConfig: RabbitMQConsumersConfig,
    private readonly configService: ConfigService<{ ENVIRONMENT: "local" | "deployed" }>,
  ) { }

  async listen(app: INestApplication) {
    this.app = app;

    const environment = this.configService.getOrThrow('ENVIRONMENT');

    try {
      this.stopConsumers = await createRabbitMQConsumers(this.consumerConfig, environment);
    } catch (error) {
      this.logger.error(error);
      await this.app.close();
    }
  }

  async onApplicationShutdown(signal?: string) {
    if (this.stopConsumers) {
      this.logger.log(`Received ${signal}. Shutting down RabbitMQ consumers...`);
      await this.stopConsumers();
      this.logger.log("RabbitMQ consumers shut down successfully");
    }
  }
}
