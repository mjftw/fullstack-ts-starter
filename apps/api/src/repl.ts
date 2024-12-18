import { AppModule } from './app.module';
import { repl } from '@nestjs/core';

async function bootstrap() {
  await repl(AppModule);
}
bootstrap();
