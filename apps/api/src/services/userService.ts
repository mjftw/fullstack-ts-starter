import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repository/users/usersRepository.service';
import { InsertUser, User } from '../database/drizzle/schema';

@Injectable()
export class UserService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(user: InsertUser): Promise<User> {
    return await this.usersRepository.create(user);
  }

  async findAllUsers(): Promise<User[]> {
    return await this.usersRepository.findAll();
  }
}
