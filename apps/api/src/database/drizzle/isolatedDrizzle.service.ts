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

type DatabaseConfig = {
  readonly DATABASE_URL: string;
};

class DrizzleInitializationError extends Error {
  constructor(message: string) {
    super(`Drizzle Initialization Error: ${message}`);
  }
}

/** This DrizzleService implementation gives a fully isolated database, useful for testing.
 * It is cloned from a template database, which must exist in the main database beforehand.
 */
@Injectable()
export class IsolatedDrizzleService<TSchema extends Record<string, unknown>>
  implements DrizzleService<TSchema>, OnModuleInit, OnModuleDestroy
{
  private readonly txAsyncLocalStorage = new AsyncLocalStorage<
    DrizzleTransaction<TSchema>
  >();
  private readonly isolatedDatabaseUrl: string;
  private readonly adminSql: postgres.Sql;
  private readonly isolatedDatabaseName: string;
  private readonly templateDatabaseName: string;

  // These are initialised in onModuleInit
  private drizzleClient?: PostgresJsDatabase<TSchema>;
  private isolatedSql?: postgres.Sql;

  constructor(
    private readonly configService: ConfigService<DatabaseConfig>,
    private readonly schema: TSchema,
    templateDatabaseName = 'template_database',
  ) {
    const adminDatabaseUrl =
      this.configService.getOrThrow<string>('DATABASE_URL');

    this.isolatedDatabaseName = `isolated_${randomUUID()}`;
    this.templateDatabaseName = templateDatabaseName;

    this.isolatedDatabaseUrl = swapDatabaseInURL(
      adminDatabaseUrl,
      this.isolatedDatabaseName,
    );
    this.adminSql = postgres(adminDatabaseUrl);
  }

  async onModuleInit() {
    await this
      .adminSql`CREATE DATABASE "${this.adminSql.unsafe(this.isolatedDatabaseName)}" WITH TEMPLATE "${this.adminSql.unsafe(this.templateDatabaseName)}";`;

    this.isolatedSql = postgres(this.isolatedDatabaseUrl);
    this.drizzleClient = drizzle(this.isolatedSql, {
      schema: this.schema,
    });

    // Database connection is initialised by executing a query
    await this.drizzleClient.execute(sql`SELECT 1;`);
  }

  async onModuleDestroy() {
    // Close the connection to the isolated database
    this.isolatedSql?.end();

    // Drop the isolated database
    await this
      .adminSql`DROP DATABASE IF EXISTS "${this.adminSql.unsafe(this.isolatedDatabaseName)}";`;
    await this.adminSql.end();
  }

  // Resolve active transaction or fallback to base client
  get db(): PostgresJsDatabase<TSchema> | DrizzleTransaction<TSchema> {
    if (!this.drizzleClient) {
      throw new DrizzleInitializationError(
        'Client not initialized - ensure onModuleInit is called',
      );
    }

    return this.txAsyncLocalStorage.getStore() ?? this.drizzleClient;
  }

  async transaction<R>(
    callback: (tx: DrizzleTransaction<TSchema>) => Promise<R>,
  ): Promise<R> {
    if (!this.drizzleClient) {
      throw new DrizzleInitializationError(
        'Client not initialized - ensure onModuleInit is called',
      );
    }

    return this.drizzleClient.transaction((tx) =>
      this.txAsyncLocalStorage.run(tx, () => callback(tx)),
    );
  }
}
