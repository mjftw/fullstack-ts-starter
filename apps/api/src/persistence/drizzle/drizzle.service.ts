import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private readonly queryClient: postgres.Sql;
  public readonly db: ReturnType<typeof drizzle>;

  constructor(private readonly configService: ConfigService) {
    this.queryClient = postgres(
      this.configService.getOrThrow<string>('DATABASE_URL'),
    );
    this.db = drizzle(this.queryClient, { schema: schema });
  }

  async onModuleInit() {
    // Connection is established when making the first query
    await this.queryClient`SELECT 1`;
  }

  async onModuleDestroy() {
    await this.queryClient.end();
  }
}
