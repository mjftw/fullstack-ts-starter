import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { DatabaseDriverService } from './databaseDriver.service';

describe('DatabaseDriverService', () => {
  let databaseDriver: DatabaseDriverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseDriverService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: vi
              .fn()
              .mockReturnValue('postgres://test:test@localhost:5432/mydb'),
          },
        },
      ],
    }).compile();

    databaseDriver = module.get<DatabaseDriverService>(DatabaseDriverService);
  });

  it('should be defined', () => {
    expect(databaseDriver).toBeDefined();
  });

  it('should allow querying', async () => {
    const result = await databaseDriver.sql`SELECT 1;`;
    expect(result).toEqual([{ '?column?': 1 }]);
  });
});
