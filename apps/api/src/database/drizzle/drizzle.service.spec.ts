import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from './drizzle.service';
import { sql } from 'drizzle-orm';
import { DatabaseDriverService } from '../driver/databaseDriver.service';
import * as schema from './schema';
describe('DrizzleService', () => {
  let drizzle: DrizzleService<typeof schema>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseDriverService,
        {
          provide: DrizzleService,
          useFactory: (databaseDriver: DatabaseDriverService) => {
            return new DrizzleService(databaseDriver, schema);
          },
          inject: [DatabaseDriverService],
        },
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

    drizzle = module.get<DrizzleService<typeof schema>>(DrizzleService);

    // Clear the database before each test
    await drizzle.db.execute(sql`DELETE FROM ${schema.usersTable}`);
  });

  it('should be defined', () => {
    expect(drizzle).toBeDefined();
  });

  it('should allow querying', async () => {
    const result = await drizzle.db.execute(sql`SELECT 1;`);
    expect(result).toEqual([{ '?column?': 1 }]);
  });

  it('should apply successful transactions', async () => {
    const userData = {
      email: 'test@test.com',
      name: 'John',
    };

    await drizzle.transaction(async (tx) => {
      await tx.insert(schema.usersTable).values(userData);
    });

    const [user] = await drizzle.db.select().from(schema.usersTable);

    expect(user).toMatchObject(userData);
  });

  it('should rollback failed transactions', async () => {
    await expect(
      drizzle.transaction(async (tx) => {
        await tx
          .insert(schema.usersTable)
          .values({ name: 'Arthur Dent', email: 'test@test.com' });

        const usersInTx = await drizzle.db.select().from(schema.usersTable);

        // Check user was created in the transaction
        expect(usersInTx).toMatchObject([
          { name: 'Arthur Dent', email: 'test@test.com' },
        ]);

        // Throw an error to simulate a failed transaction
        throw new Error('Something went wrong');
      }),
    ).rejects.toThrow('Something went wrong');

    const users = await drizzle.db.select().from(schema.usersTable);

    // The transaction should have been rolled back due to the error,
    // so the user should not be in the database
    expect(users).toEqual([]);
  });
});
