import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { validationSchemaForEnv } from '../config/environment-variables';
import { User } from '../persistence/drizzle/schema';
import { UsersRepository } from '../repository/users/usersRepository.service';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersRepository: { findAll: jest.Mock };

  beforeEach(async () => {
    usersRepository = {
      findAll: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validationSchema: validationSchemaForEnv,
        }),
      ],
      controllers: [UsersController],
      providers: [
        {
          provide: UsersRepository,
          useValue: usersRepository,
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
  });

  describe('users', () => {
    it('should return all users', async () => {
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

    it('should handle empty user list', async () => {
      const result = await usersController.findAll();

      expect(result).toEqual([]);
      expect(usersRepository.findAll).toHaveBeenCalled();
    });
  });
});
