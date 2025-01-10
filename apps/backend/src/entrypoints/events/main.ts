import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsumerService } from '~/events/consume/consumer.service';

declare const module: any;
async function bootstrap() {
  const logger = new Logger('EntryPoint [Event Consumers]');
  const app = await NestFactory.create(AppModule);
  const consumerService = app.get(ConsumerService);

  await consumerService.listen(app);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
  logger.log(`Event Consumers running`);
}
bootstrap();
