import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

declare const module: any;
async function bootstrap() {
  const logger = new Logger('EntryPoint [ReactSSR]');
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const PORT = 3000;

  await app.listen(PORT);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
  logger.log(`SSR React app running at http://localhost:${PORT}`);
}
bootstrap();
