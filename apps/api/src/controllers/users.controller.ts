import { Controller, Get, Post, Body } from '@nestjs/common';
import { InsertUser, User } from '../database/drizzle/schema';
import { UsersRepository } from '../repository/users/users.repository';

@Controller('/api/users')
export class UsersController {
  constructor(private readonly usersRepository: UsersRepository) { }

  @Post()
  async createUser(@Body() user: InsertUser): Promise<User> {
    return await this.usersRepository.create(user);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersRepository.findAll();
  }
}
