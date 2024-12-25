import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from './drizzle.service';
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
});
