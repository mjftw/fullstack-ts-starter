import { describe, expect, vi } from 'vitest';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { sql } from 'drizzle-orm';
import * as schema from './schema';
import { DrizzleService } from './drizzle.service';
import { IsolatedDrizzleService } from './isolatedDrizzle.service';
import { createModuleTest } from 'test/utils/vitest';

describe.concurrent('IsolatedDrizzleService', () => {
  const test = createModuleTest({
    providers: [
      {
        provide: DrizzleService,
        useFactory: (config: ConfigService) => {
          return new IsolatedDrizzleService(config, schema);
        },
        inject: [ConfigService],
      },
    ],
    imports: [
      ConfigModule.forFeature(() => ({
        DATABASE_URL: process.env.DATABASE_URL,
      })),
    ],
  });

  test('should be defined', ({ module }) => {
    const drizzle = module.get<DrizzleService<typeof schema>>(DrizzleService);
    expect(drizzle).toBeDefined();
  });

  test('should allow querying', async ({ module }) => {
    const drizzle = module.get<DrizzleService<typeof schema>>(DrizzleService);
    const result = await drizzle.db.execute(sql`SELECT 1;`);
    expect(result).toEqual([{ '?column?': 1 }]);
  });

  test('should apply successful transactions', async ({ module }) => {
    const drizzle = module.get<DrizzleService<typeof schema>>(DrizzleService);
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

  test('should rollback failed transactions', async ({ module }) => {
    const drizzle = module.get<DrizzleService<typeof schema>>(DrizzleService);
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

  test('should handle nested transactions correctly', async ({ module }) => {
    const drizzle = module.get<DrizzleService<typeof schema>>(DrizzleService);
    const userData1 = { email: 'user1@test.com', name: 'User 1' };
    const userData2 = { email: 'user2@test.com', name: 'User 2' };

    await drizzle.transaction(async (outerTx) => {
      await outerTx.insert(schema.usersTable).values(userData1);

      // Nested transaction
      await drizzle.transaction(async (innerTx) => {
        await innerTx.insert(schema.usersTable).values(userData2);
      });
    });

    const users = await drizzle.db.select().from(schema.usersTable);
    expect(users).toHaveLength(2);
    expect(users).toEqual(
      expect.arrayContaining([
        expect.objectContaining(userData1),
        expect.objectContaining(userData2),
      ]),
    );
  });

  test('should rollback nested transactions on failure', async ({ module }) => {
    const drizzle = module.get<DrizzleService<typeof schema>>(DrizzleService);
    const userData1 = { email: 'user1@test.com', name: 'User 1' };
    const userData2 = { email: 'user2@test.com', name: 'User 2' };

    await expect(
      drizzle.transaction(async (outerTx) => {
        await outerTx.insert(schema.usersTable).values(userData1);

        // Nested transaction that fails
        await drizzle.transaction(async (innerTx) => {
          await innerTx.insert(schema.usersTable).values(userData2);
          throw new Error('Inner transaction failed');
        });
      }),
    ).rejects.toThrow('Inner transaction failed');

    const users = await drizzle.db.select().from(schema.usersTable);
    expect(users).toEqual([]);
  });

  test('should allow outer transaction to succeed when inner transaction fails but is caught', async ({
    module,
  }) => {
    const drizzle = module.get<DrizzleService<typeof schema>>(DrizzleService);
    const outerUserData = { email: 'outer@test.com', name: 'Outer User' };
    const innerUserData = { email: 'inner@test.com', name: 'Inner User' };

    await drizzle.transaction(async (outerTx) => {
      await outerTx.insert(schema.usersTable).values(outerUserData);

      try {
        await drizzle.transaction(async (innerTx) => {
          await innerTx.insert(schema.usersTable).values(innerUserData);
          throw new Error('Inner transaction error');
        });
      } catch (error) {
        // Inner transaction error is caught, allowing outer transaction to continue
        expect((error as Error).message).toBe('Inner transaction error');
      }
    });

    const users = await drizzle.db.select().from(schema.usersTable);

    // Only the outer transaction's user should exist
    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject(outerUserData);
  });
});
