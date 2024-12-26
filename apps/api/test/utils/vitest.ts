import { TestingModule } from '@nestjs/testing';

import { Test } from '@nestjs/testing';
import { test } from 'vitest';

export function createModuleTest(
  ...createTestingModuleArgs: Parameters<typeof Test.createTestingModule>
) {
  const moduleTest = test.extend<{ module: TestingModule }>({
    module: async ({}, use) => {
      const module = await Test.createTestingModule(
        ...createTestingModuleArgs,
      ).compile();

      return use(module);
    },
  });

  return moduleTest;
}
