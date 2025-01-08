import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../database/drizzle/drizzle.service';
import * as schema from '../../database/drizzle/schema';
@Injectable()
export class UsersRepository {
  constructor(private readonly drizzleService: DrizzleService<typeof schema>) {}

  async create(user: schema.InsertUser): Promise<schema.User> {
    const [createdUser] = await this.drizzleService.db
      .insert(schema.usersTable)
      .values(user)
      .returning();

    return createdUser;
  }

  async findAll(): Promise<schema.User[]> {
    return await this.drizzleService.db.select().from(schema.usersTable);
  }
}
