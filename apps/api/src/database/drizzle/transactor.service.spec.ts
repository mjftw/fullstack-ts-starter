import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from './prodDrizzle.service';
import { Transactor } from './transactor.service';
import { DatabaseDriverService } from '../driver/databaseDriver.service';
import * as schema from './schema';

describe('Transactor', () => {
  let transactor: Transactor;
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
        Transactor,
      ],
    }).compile();

    transactor = module.get<Transactor>(Transactor);
    drizzle = module.get<DrizzleService<typeof schema>>(DrizzleService);

    // Clear the database before each test
    await drizzle.db.delete(schema.usersTable);
  });

  it('should be defined', () => {
    expect(transactor).toBeDefined();
  });

  it('should successfully execute transaction', async () => {
    const userData = {
      email: 'test@test.com',
      name: 'John',
    };

    await transactor.runInTransaction(async () => {
      await drizzle.db.insert(schema.usersTable).values(userData);
    });

    const [user] = await drizzle.db.select().from(schema.usersTable);
    expect(user).toMatchObject(userData);
  });

  it('should rollback failed transactions', async () => {
    await expect(
      transactor.runInTransaction(async () => {
        await drizzle.db
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

  it('should maintain transaction isolation', async () => {
    const isolationTest = async () => {
      await transactor.runInTransaction(async () => {
        await drizzle.db
          .insert(schema.usersTable)
          .values({ name: 'Test User', email: 'isolation@test.com' });

        // This should be visible inside the transaction
        const [userInTx] = await drizzle.db.select().from(schema.usersTable);
        expect(userInTx).toMatchObject({
          name: 'Test User',
          email: 'isolation@test.com',
        });

        throw new Error('Rollback transaction');
      });
    };

    await expect(isolationTest()).rejects.toThrow('Rollback transaction');

    // After rollback, the user should not exist
    const users = await drizzle.db.select().from(schema.usersTable);
    expect(users).toEqual([]);
  });

  it('should handle nested transactions through transactor correctly', async () => {
    const userData1 = { email: 'user1@test.com', name: 'User 1' };
    const userData2 = { email: 'user2@test.com', name: 'User 2' };

    await transactor.runInTransaction(async () => {
      await drizzle.db.insert(schema.usersTable).values(userData1);

      // Nested transaction
      await transactor.runInTransaction(async () => {
        await drizzle.db.insert(schema.usersTable).values(userData2);
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

  it('should rollback nested transactions on inner failure', async () => {
    const userData1 = { email: 'user1@test.com', name: 'User 1' };
    const userData2 = { email: 'user2@test.com', name: 'User 2' };

    await expect(
      transactor.runInTransaction(async () => {
        await drizzle.db.insert(schema.usersTable).values(userData1);

        // Nested transaction that fails
        await transactor.runInTransaction(async () => {
          await drizzle.db.insert(schema.usersTable).values(userData2);
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

    await transactor.runInTransaction(async () => {
      await drizzle.db.insert(schema.usersTable).values(outerUserData);

      try {
        await transactor.runInTransaction(async () => {
          await drizzle.db.insert(schema.usersTable).values(innerUserData);
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
