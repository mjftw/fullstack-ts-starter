import { describe, expect } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from '../../database/drizzle/prodDrizzle.service';
import { UsersRepository } from './usersRepository.service';
import { DatabaseDriverService } from '../../database/driver/databaseDriver.service';
import * as schema from '../../database/drizzle/schema';
import { createModuleTest } from 'test/utils/vitest';

describe('UsersRepository', () => {
  const test = createModuleTest(
    {
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
            getOrThrow: () => 'postgres://test:test@localhost:5432/mydb',
          },
        },
        UsersRepository,
      ],
    },
    {
      afterEach: async ({ module }) => {
        const drizzle =
          module.get<DrizzleService<typeof schema>>(DrizzleService);
        await drizzle.db.delete(schema.usersTable);
      },
    },
  );

  test('should be defined', ({ module }) => {
    const usersRepository = module.get<UsersRepository>(UsersRepository);
    expect(usersRepository).toBeDefined();
  });

  describe('create', () => {
    test('should create a new user', async ({ module }) => {
      const usersRepository = module.get<UsersRepository>(UsersRepository);
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const createdUser = await usersRepository.create(userData);

      expect(createdUser).toMatchObject(userData);
      expect(createdUser.id).toBeDefined();
    });

    test('should enforce unique email constraint', async ({ module }) => {
      const usersRepository = module.get<UsersRepository>(UsersRepository);
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      await usersRepository.create(userData);

      await expect(usersRepository.create(userData)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    test('should return empty array when no users exist', async ({
      module,
    }) => {
      const usersRepository = module.get<UsersRepository>(UsersRepository);
      const users = await usersRepository.findAll();
      expect(users).toEqual([]);
    });

    test('should return all created users', async ({ module }) => {
      const usersRepository = module.get<UsersRepository>(UsersRepository);
      const userData1 = {
        email: 'user1@example.com',
        name: 'User One',
      };
      const userData2 = {
        email: 'user2@example.com',
        name: 'User Two',
      };

      await usersRepository.create(userData1);
      await usersRepository.create(userData2);

      const users = await usersRepository.findAll();

      expect(users).toHaveLength(2);
      expect(users).toEqual(
        expect.arrayContaining([
          expect.objectContaining(userData1),
          expect.objectContaining(userData2),
        ]),
      );
    });
  });
});
