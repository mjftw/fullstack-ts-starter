import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../database/drizzle/drizzle.service';
import { InsertUser, User, usersTable } from '../../database/drizzle/schema';

@Injectable()
export class UsersRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(user: InsertUser): Promise<User> {
    const [createdUser] = await this.drizzleService.db
      .insert(usersTable)
      .values(user)
      .returning();

    return createdUser;
  }

  async findAll(): Promise<User[]> {
    return await this.drizzleService.db.select().from(usersTable);
  }
}
