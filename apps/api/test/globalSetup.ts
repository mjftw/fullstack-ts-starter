import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import path from 'path';
import postgres from 'postgres';
import { swapDatabaseInURL } from 'src/database/utils';

const TEMPLATE_DB_NAME = 'template_database' as const;

/** Vitest global setup function. Runs once before all tests. */
export default async function setup() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  console.log('Creating template database for testing...');

  await createTemplateDatabase(process.env.DATABASE_URL);
}

/**
 * Creates a template database for testing by resetting it and then setting it up.
 * Once set up, we can use the template database to create a new database for each test.
 * @param databaseUrl - The database URL to use.
 */
async function createTemplateDatabase(databaseUrl: string) {
  const adminSql = postgres(databaseUrl);

  // Reset and create template database
  await resetTemplateDatabase(adminSql);
  await adminSql.end();

  // Setup and migrate template database
  const templateConfig = await setupTemplateDatabase(databaseUrl);
  await templateConfig.sql.end();
}
/**
 * Resets the template database by dropping it if it exists and creating a new one.
 * @param sql - The database connection to use.
 */
async function resetTemplateDatabase(sql: postgres.Sql) {
  // Need to set to not being a template database in order to delete it
  await sql`UPDATE pg_database SET datistemplate = false WHERE datname = '${sql.unsafe(TEMPLATE_DB_NAME)}'`;
  await sql`DROP DATABASE IF EXISTS ${sql.unsafe(TEMPLATE_DB_NAME)}`;
  await sql`CREATE DATABASE ${sql.unsafe(TEMPLATE_DB_NAME)}`;
}

/**
 * Sets up the template database by applying migrations and marking it as a template.
 * @param dbUrl - The database URL to use.
 * @returns The database configuration.
 */
async function setupTemplateDatabase(dbUrl: string) {
  const templateUrl = swapDatabaseInURL(dbUrl, TEMPLATE_DB_NAME);
  const sql = postgres(templateUrl);
  const db = drizzle(sql);

  // Apply migrations
  await migrate(db, {
    migrationsFolder: path.join(__dirname, '..', 'drizzle'),
  });

  // Mark the database as a template
  await sql`UPDATE pg_database SET datistemplate = true WHERE datname = '${sql.unsafe(TEMPLATE_DB_NAME)}'`;

  return { sql, db };
}
