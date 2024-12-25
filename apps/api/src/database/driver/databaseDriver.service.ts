import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import postgres from 'postgres';

@Injectable()
export class DatabaseDriverService implements OnModuleInit, OnModuleDestroy {
  public readonly sql: postgres.Sql;

  constructor(private readonly configService: ConfigService) {
    this.sql = postgres(this.configService.getOrThrow<string>('DATABASE_URL'));
  }

  async onModuleInit() {
    // Connection is established when making the first query
    await this.sql`SELECT 1`;
  }

  async onModuleDestroy() {
    await this.sql.end();
  }
}
