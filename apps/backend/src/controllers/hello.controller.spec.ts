import { describe, expect } from 'vitest';
import { HelloController } from './hello.controller';
import { HelloService } from '../services/hello.service';

import { createModuleTest } from 'test/utils/vitest';

describe('HelloController', () => {
  const test = createModuleTest({
    controllers: [HelloController],
    providers: [HelloService],
  });

  describe('getHello', () => {
    test('should return "Hello World!"', async ({ module }) => {
      const helloController = module.get(HelloController);

      expect(await helloController.getHello()).toEqual({
        message: 'Hello World',
      });
    });
  });
});
