import { describe, expect } from 'vitest';
import { AppController } from './app.controller';
import { AppService } from '../app.service';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '../config/environment-variables';
import { createModuleTest } from 'test/utils/vitest';

describe('AppController', () => {
  const test = createModuleTest({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        validate: () => validateEnv({ DATABASE_URL: 'test' }),
      }),
    ],
    controllers: [AppController],
    providers: [AppService],
  });

  describe('root', () => {
    test('should return "Hello World!"', async ({ module }) => {
      const appController = module.get(AppController);

      expect(await appController.getHello()).toEqual({
        message: 'Hello World',
      });
    });
  });
});
