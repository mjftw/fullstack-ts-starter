import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

declare const module: any;
async function bootstrap() {
    const logger = new Logger('EntryPoint [API]');
    const app = await NestFactory.create(AppModule, {
        // Collect metadata necessary for Nest Devtools to visualise the dependency graph.
        snapshot: process.env.NODE_ENV !== 'production',
      });
      app.enableCors();

      // Secure HTTP headers - defualt settings
      app.use(helmet());
    
      const config = new DocumentBuilder()
        .setTitle('Example API')
        .setDescription('API Docs for the Example API')
        .setVersion('1.0')
        .build();
    
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('/', app, document);

    const PORT = 5002;

    await app.listen(PORT);

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
    logger.log(`API Server running on http://localhost:${PORT}`);
}
bootstrap();
