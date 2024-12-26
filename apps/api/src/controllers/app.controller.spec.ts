import { describe, expect } from 'vitest';
import { AppController } from './app.controller';
import { AppService } from '../app.service';

import { createModuleTest } from 'test/utils/vitest';

describe('AppController', () => {
  const test = createModuleTest({
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
