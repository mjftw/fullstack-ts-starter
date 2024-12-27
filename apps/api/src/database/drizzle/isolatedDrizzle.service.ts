import { AsyncLocalStorage } from 'async_hooks';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { ConfigService } from '@nestjs/config';
import { DrizzleService, DrizzleTransaction } from './drizzle.service';
import { randomUUID } from 'crypto';
import { swapDatabaseInURL } from '../utils';
import { sql } from 'drizzle-orm';

/** This DrizzleService implementation gives a fully isolated database, useful for testing.
 * It is cloned from a template database, which must exist in the main database beforehand.
 */
@Injectable()
export class IsolatedDrizzleService<TSchema extends Record<string, unknown>>
  implements DrizzleService<TSchema>, OnModuleInit, OnModuleDestroy
{
  private drizzleClient: PostgresJsDatabase<TSchema> | null = null;
  private isolatedSql: postgres.Sql | null = null;
  private readonly isolatedDatabaseUrl: string;
  private readonly adminSql: postgres.Sql;
  private readonly isolatedDatabaseName: string;
  private readonly templateDatabaseName: string;
  private readonly txAsyncLocalStorage = new AsyncLocalStorage<
    DrizzleTransaction<TSchema>
  >();

  constructor(
    private readonly configService: ConfigService<{ DATABASE_URL: string }>,
    private readonly schema: TSchema,
    templateDatabaseName = 'template_database',
  ) {
    this.isolatedDatabaseName = `isolated_${randomUUID()}`;
    this.templateDatabaseName = templateDatabaseName;

    const adminDatabaseUrl =
      this.configService.getOrThrow<string>('DATABASE_URL');

    this.isolatedDatabaseUrl = swapDatabaseInURL(
      adminDatabaseUrl,
      this.isolatedDatabaseName,
    );

    this.adminSql = postgres(
      this.configService.getOrThrow<string>('DATABASE_URL'),
    );
  }

  async onModuleInit() {
    console.log('onModuleInit');
    await this
      .adminSql`CREATE DATABASE "${this.adminSql.unsafe(this.isolatedDatabaseName)}" WITH TEMPLATE "${this.adminSql.unsafe(this.templateDatabaseName)}";`;

    console.log('Created isolated database:', this.isolatedDatabaseName);

    this.isolatedSql = postgres(this.isolatedDatabaseUrl);
    this.drizzleClient = drizzle(this.isolatedSql, {
      schema: this.schema,
    });

    // Database connection is initialised by executing a query
    await this.drizzleClient.execute(sql`SELECT 1;`);

    console.log('Initialised isolated database:', this.isolatedDatabaseName);
  }

  async onModuleDestroy() {
    console.log('onModuleDestroy');
    this.isolatedSql?.end();
    await this
      .adminSql`DROP DATABASE IF EXISTS "${this.adminSql.unsafe(this.isolatedDatabaseName)}";`;
    await this.adminSql.end();
  }

  // Resolve active transaction or fallback to base client
  get db(): PostgresJsDatabase<TSchema> | DrizzleTransaction<TSchema> {
    if (!this.drizzleClient) {
      throw new Error(
        'Drizzle client not initialized - ensure onModuleInit is called',
      );
    }
    return this.txAsyncLocalStorage.getStore() || this.drizzleClient;
  }

  async transaction<R>(
    callback: (tx: DrizzleTransaction<TSchema>) => Promise<R>,
  ): Promise<R> {
    if (!this.drizzleClient) {
      throw new Error(
        'Drizzle client not initialized - ensure onModuleInit is called',
      );
    }

    return this.drizzleClient.transaction((tx) => {
      return this.txAsyncLocalStorage.run(tx, () => callback(tx));
    });
  }
}
