import { TestingModule } from '@nestjs/testing';

import { Test } from '@nestjs/testing';
import { test } from 'vitest';

export function createModuleTest(
  metadata: Parameters<typeof Test.createTestingModule>[0],
) {
  const moduleTest = test.extend<{ module: TestingModule }>({
    module: async ({}, use) => {
      const module = await Test.createTestingModule({
        ...metadata,
      }).compile();

      return use(module);
    },
  });

  return moduleTest;
}
