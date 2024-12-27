import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from './drizzle.service';
import { sql } from 'drizzle-orm';
import * as schema from './schema';
describe('DrizzleService', () => {
  let drizzle: DrizzleService<typeof schema>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DrizzleService,
          useFactory: (config: ConfigService) => {
            return new DrizzleService(config, schema);
          },
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
    await drizzle.db.delete(schema.usersTable);
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

  it('should handle nested transactions correctly', async () => {
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

  it('should rollback nested transactions on failure', async () => {
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

  it('should allow outer transaction to succeed when inner transaction fails but is caught', async () => {
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
        expect(error.message).toBe('Inner transaction error');
      }
    });

    const users = await drizzle.db.select().from(schema.usersTable);

    // Only the outer transaction's user should exist
    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject(outerUserData);
  });
});
