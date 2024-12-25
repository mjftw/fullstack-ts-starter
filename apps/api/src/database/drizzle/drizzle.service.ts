import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import { DatabaseDriverService } from '../driver/databaseDriver.service';

export type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;
export type DrizzleTransaction = Parameters<
  Parameters<DrizzleClient['transaction']>[0]
>[0];

@Injectable()
export class DrizzleService {
  public readonly drizzleClient: DrizzleClient;
  private readonly asyncLocalStorage =
    new AsyncLocalStorage<DrizzleTransaction>();

  constructor(private readonly databaseDriver: DatabaseDriverService) {
    this.drizzleClient = drizzle(this.databaseDriver.queryClient, {
      schema: schema,
    });
  }

  // Resolve active transaction or fallback to base client
  get db(): DrizzleClient | DrizzleTransaction {
    return this.asyncLocalStorage.getStore() || this.drizzleClient;
  }

  async transaction<R>(
    callback: (tx: DrizzleTransaction) => Promise<R>,
  ): Promise<R> {
    return this.drizzleClient.transaction((tx) => {
      return this.asyncLocalStorage.run(tx, () => callback(tx));
    });
  }
}
