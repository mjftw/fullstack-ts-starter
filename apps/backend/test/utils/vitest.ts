import { TestingModule } from '@nestjs/testing';

import { Test } from '@nestjs/testing';
import { test, afterEach } from 'vitest';

export function createModuleTest(
  createTestingModuleArg: Parameters<typeof Test.createTestingModule>[0],
  options?: {
    beforeEach?: ({ module }: { module: TestingModule }) => Promise<void>;
    afterEach?: ({ module }: { module: TestingModule }) => Promise<void>;
  },
) {
  const moduleTest = test.extend<{ module: TestingModule }>({
    module: async ({ onTestFinished }, use) => {
      const module = await Test.createTestingModule(
        createTestingModuleArg,
      ).compile();

      await module.init();

      use(module);

      onTestFinished(() => {
        module.close();
      });
    },
  });

  options?.beforeEach &&
    beforeEach(async ({ module }: { module: TestingModule }) => {
      await options.beforeEach?.({ module });
    });

  options?.afterEach &&
    afterEach(async ({ module }: { module: TestingModule }) => {
      await options.afterEach?.({ module });
    });

  return moduleTest;
}
