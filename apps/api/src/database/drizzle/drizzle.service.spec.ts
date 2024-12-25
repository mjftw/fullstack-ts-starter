import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from './drizzle.service';
import { sql } from 'drizzle-orm';
import { DatabaseDriverService } from '../driver/databaseDriver.service';

describe('DrizzleService', () => {
  let drizzle: DrizzleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseDriverService,
        DrizzleService,
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

    drizzle = module.get<DrizzleService>(DrizzleService);
  });

  it('should be defined', () => {
    expect(drizzle).toBeDefined();
  });

  it('should allow querying', async () => {
    const result = await drizzle.db.execute(sql`SELECT 1;`);
    expect(result).toEqual([{ '?column?': 1 }]);
  });
});
