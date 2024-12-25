import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DatabaseDriverService } from '../driver/databaseDriver.service';

export type DrizzleTransaction<TSchema extends Record<string, unknown>> =
  Parameters<Parameters<PostgresJsDatabase<TSchema>['transaction']>[0]>[0];

@Injectable()
export class DrizzleService<TSchema extends Record<string, unknown>> {
  public readonly drizzleClient: PostgresJsDatabase<TSchema>;
  private readonly asyncLocalStorage = new AsyncLocalStorage<
    DrizzleTransaction<TSchema>
  >();

  constructor(
    private readonly databaseDriver: DatabaseDriverService,
    schema: TSchema,
  ) {
    this.drizzleClient = drizzle(this.databaseDriver.sql, {
      schema,
    });
  }

  // Resolve active transaction or fallback to base client
  get db(): PostgresJsDatabase<TSchema> | DrizzleTransaction<TSchema> {
    return this.asyncLocalStorage.getStore() || this.drizzleClient;
  }

  async transaction<R>(
    callback: (tx: DrizzleTransaction<TSchema>) => Promise<R>,
  ): Promise<R> {
    return this.drizzleClient.transaction((tx) => {
      return this.asyncLocalStorage.run(tx, () => callback(tx));
    });
  }
}
