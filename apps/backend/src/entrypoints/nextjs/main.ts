import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

declare const module: any;
async function bootstrap() {
  const logger = new Logger('EntryPoint [NextJS]');
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  // Secure HTTP headers - defualt settings
  // See https://helmetjs.github.io/ for more info on settings
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'https:'],
          'connect-src': ["'self'", 'http://localhost:*', 'ws://localhost:*'],
        },
      },
    }),
  );
  const PORT = 5000;

  await app.listen(PORT);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
  logger.log(`SSR React app running at http://localhost:${PORT}`);
}
bootstrap();
