import { describe, Mocked, vi } from 'vitest';
import { User } from '../database/drizzle/schema';
import { UsersRepository } from '../repository/users/usersRepository.service';
import { UsersController } from './users.controller';
import { createModuleTest } from 'test/utils/vitest';

describe('UsersController', () => {
  const test = createModuleTest({
    controllers: [UsersController],
    providers: [
      {
        provide: UsersRepository,
        useValue: {
          findAll: vi.fn(),
        },
      },
    ],
  });

  describe('users', () => {
    test('should return all users', async ({ module }) => {
      const usersController = module.get(UsersController);
      const usersRepository =
        module.get<Mocked<UsersRepository>>(UsersRepository);

      const mockUsers: User[] = [
        {
          id: '6b147940-9676-4e73-9b61-c2d44a5563d4',
          name: 'Zaphod Beeblebrox',
          email: 'zaphod@presedent.com',
        },
        {
          id: '4b268ab0-de4d-4ab8-aa53-cb743c34f6d9',
          name: 'Arthur Dent',
          email: 'arthur@earth.com',
        },
      ];

      usersRepository.findAll.mockResolvedValue(mockUsers);
      const result = await usersController.findAll();

      expect(result).toEqual(mockUsers);
      expect(usersRepository.findAll).toHaveBeenCalled();
    });

    test('should handle empty user list', async ({ module }) => {
      const usersController = module.get(UsersController);
      const usersRepository =
        module.get<Mocked<UsersRepository>>(UsersRepository);

      usersRepository.findAll.mockResolvedValue([]);

      const result = await usersController.findAll();

      expect(result).toEqual([]);
      expect(usersRepository.findAll).toHaveBeenCalled();
    });
  });
});
