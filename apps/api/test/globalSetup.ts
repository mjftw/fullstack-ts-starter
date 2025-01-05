import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import path from 'path';
import postgres from 'postgres';
import { hashElement } from 'folder-hash';
import { swapDatabaseInURL } from 'src/database/utils';

const TEMPLATE_DB_NAME = 'template_database' as const;

/** Vitest global setup function. Runs once before all tests. */
export default async function setup() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const migrationsDir = path.join(__dirname, '..', 'drizzle');

  await createTemplateDatabase(process.env.DATABASE_URL, migrationsDir);
}

async function hashMigrations(migrationsDir: string): Promise<string> {
  const hashResult = await hashElement(migrationsDir, {
    encoding: 'hex',
  });
  return hashResult.hash;
}

async function saveMigrationsHash(sql: postgres.Sql, migrationsHash: string) {
  await sql`CREATE SCHEMA IF NOT EXISTS template_database_meta`;
  await sql`CREATE TABLE IF NOT EXISTS template_database_meta.migrations_hash (
    id SERIAL PRIMARY KEY,
    hash TEXT NOT NULL
  )`;
  await sql`INSERT INTO template_database_meta.migrations_hash (hash) VALUES (${migrationsHash})`;
}

async function readMigrationsHash(sql: postgres.Sql): Promise<string | null> {
  const metaCheckResult = await sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'template_database_meta'
      AND table_name = 'migrations_hash'
    ) AS table_exists,
    EXISTS (
      SELECT 1 FROM information_schema.schemata
      WHERE schema_name = 'template_database_meta'
    ) AS schema_exists
  `;

  if (!metaCheckResult[0]?.table_exists || !metaCheckResult[0]?.schema_exists) {
    return null;
  }

  const result =
    await sql`SELECT hash FROM template_database_meta.migrations_hash ORDER BY id DESC LIMIT 1`;
  return result[0]?.hash ?? null;
}

/**
 * Creates a template database for testing by resetting it and then setting it up.
 * Once set up, we can use the template database to create a new database for each test.
 * @param databaseUrl - The database URL to use.
 */
async function createTemplateDatabase(
  databaseUrl: string,
  migrationsDir: string,
) {
  const adminSql = postgres(databaseUrl, {
    onnotice: () => {},
    debug: false,
  });

  const migrationsHash = await hashMigrations(migrationsDir);

  const existingHash = await readMigrationsHash(adminSql);
  if (existingHash && existingHash === migrationsHash) {
    console.log('Template database matches migrations, skipping setup...');
    return;
  }
  console.log('Creating template database for testing...');

  // Reset and create template database
  await resetTemplateDatabase(adminSql);

  // Setup and migrate template database
  const templateConfig = await setupTemplateDatabase(
    databaseUrl,
    migrationsDir,
  );

  await saveMigrationsHash(adminSql, migrationsHash);

  await adminSql.end();
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
async function setupTemplateDatabase(dbUrl: string, migrationsDir: string) {
  const templateUrl = swapDatabaseInURL(dbUrl, TEMPLATE_DB_NAME);
  const sql = postgres(templateUrl);
  const db = drizzle(sql);

  // Apply migrations
  await migrate(db, {
    migrationsFolder: migrationsDir,
  });

  // Mark the database as a template
  await sql`UPDATE pg_database SET datistemplate = true WHERE datname = '${sql.unsafe(TEMPLATE_DB_NAME)}'`;

  return { sql, db };
}
