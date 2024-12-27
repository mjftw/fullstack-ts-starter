import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export type DrizzleTransaction<TSchema extends Record<string, unknown>> =
  Parameters<Parameters<PostgresJsDatabase<TSchema>['transaction']>[0]>[0];

export abstract class DrizzleService<TSchema extends Record<string, unknown>> {
  abstract db: PostgresJsDatabase<TSchema> | DrizzleTransaction<TSchema>;

  abstract transaction<R>(
    callback: (tx: DrizzleTransaction<TSchema>) => Promise<R>,
  ): Promise<R>;
}
