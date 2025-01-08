import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { repl } from '@nestjs/core';

async function bootstrap() {
    const logger = new Logger('EntryPoint [REPL]');
    await repl(AppModule);
    logger.log('REPL started');
}
bootstrap();
