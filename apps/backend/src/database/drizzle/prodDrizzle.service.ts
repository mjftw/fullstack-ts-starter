import { AsyncLocalStorage } from 'async_hooks';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { ConfigService } from '@nestjs/config';
import { DrizzleTransaction, DrizzleService } from './drizzle.service';

@Injectable()
export class ProdDrizzleService<TSchema extends Record<string, unknown>>
  implements DrizzleService<TSchema>, OnModuleInit, OnModuleDestroy
{
  private readonly sql: postgres.Sql;
  private readonly drizzleClient: PostgresJsDatabase<TSchema>;
  private readonly txAsyncLocalStorage = new AsyncLocalStorage<
    DrizzleTransaction<TSchema>
  >();

  constructor(
    private readonly configService: ConfigService<{ DATABASE_URL: string }>,
    schema: TSchema,
  ) {
    this.sql = postgres(this.configService.getOrThrow<string>('DATABASE_URL'));

    this.drizzleClient = drizzle(this.sql, {
      schema,
    });
  }

  async onModuleInit() {
    // Connection is established when making the first query
    await this.sql`SELECT 1`;
  }

  async onModuleDestroy() {
    await this.sql.end();
  }

  // Resolve active transaction or fallback to base client
  get db(): PostgresJsDatabase<TSchema> | DrizzleTransaction<TSchema> {
    return this.txAsyncLocalStorage.getStore() || this.drizzleClient;
  }

  async transaction<R>(
    callback: (tx: DrizzleTransaction<TSchema>) => Promise<R>,
  ): Promise<R> {
    return this.drizzleClient.transaction((tx) => {
      return this.txAsyncLocalStorage.run(tx, () => callback(tx));
    });
  }
}
