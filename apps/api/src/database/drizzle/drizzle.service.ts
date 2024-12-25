import { AsyncLocalStorage } from 'async_hooks';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;
export type DrizzleTransaction = Parameters<
  Parameters<DrizzleClient['transaction']>[0]
>[0];

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  public readonly drizzleClient: DrizzleClient;
  private readonly queryClient: postgres.Sql;
  private readonly asyncLocalStorage =
    new AsyncLocalStorage<DrizzleTransaction>();

  constructor(private readonly configService: ConfigService) {
    this.queryClient = postgres(
      this.configService.getOrThrow<string>('DATABASE_URL'),
    );
    this.drizzleClient = drizzle(this.queryClient, { schema: schema });
  }

  async onModuleInit() {
    // Connection is established when making the first query
    await this.queryClient`SELECT 1`;
  }

  async onModuleDestroy() {
    await this.queryClient.end();
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
