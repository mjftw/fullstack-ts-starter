import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { hashElement } from 'folder-hash';
import { swapDatabaseInURL } from 'src/database/utils';

/**
 * Creates a template database with database migrations applied.
 * Once set up, we can use the template database to create a new database for each test.
 *
 * The template database will only be re-created if the contents of the migrations directory has changed.
 * This is done by hashing the contents of the migrations directory and comparing it to the hash stored in the database.
 * @param databaseUrl - The database URL to use.
 */
export async function setupTemplateDatabase(
  databaseUrl: string,
  migrationsDir: string,
  templateDbName: string = 'template_database',
) {
  const adminSql = postgres(databaseUrl, {
    // Prevent noisy NOTICE logs
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
  await resetTemplateDatabase(adminSql, templateDbName);

  // Setup and migrate template database
  const templateConfig = await initTemplateDatabase(
    databaseUrl,
    migrationsDir,
    templateDbName,
  );

  await saveMigrationsHash(adminSql, migrationsHash);

  await adminSql.end();
  await templateConfig.sql.end();
}

/**
 * Hashes the contents of the migrations directory.
 * @param migrationsDir - The directory to hash.
 * @returns The hash of the migrations directory.
 */
async function hashMigrations(migrationsDir: string): Promise<string> {
  const hashResult = await hashElement(migrationsDir, {
    encoding: 'hex',
  });
  return hashResult.hash;
}

/**
 * Saves the migrations hash to the database.
 *
 * Saved in a separate schema & table 'template_database_meta.migrations_hash' to avoid conflicts
 * with the main schema.
 * @param sql - The database connection to use.
 * @param migrationsHash - The hash of the migrations directory.
 */
async function saveMigrationsHash(sql: postgres.Sql, migrationsHash: string) {
  await sql`CREATE SCHEMA IF NOT EXISTS template_database_meta`;
  await sql`CREATE TABLE IF NOT EXISTS template_database_meta.migrations_hash (
    id SERIAL PRIMARY KEY,
    hash TEXT NOT NULL
  )`;
  await sql`INSERT INTO template_database_meta.migrations_hash (hash) VALUES (${migrationsHash})`;
}

/**
 * Reads the migrations hash from the database.
 * @param sql - The database connection to use.
 * @returns The hash of the migrations directory or null if the table or schema does not exist.
 */
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
 * Resets the template database by dropping it if it exists and creating a new one.
 * @param sql - The database connection to use.
 * @param templateDbName - The name of the template database.
 */
async function resetTemplateDatabase(
  sql: postgres.Sql,
  templateDbName: string,
) {
  // Need to set to not being a template database in order to delete it
  await sql`UPDATE pg_database SET datistemplate = false WHERE datname = '${sql.unsafe(templateDbName)}'`;
  await sql`DROP DATABASE IF EXISTS ${sql.unsafe(templateDbName)}`;
  await sql`CREATE DATABASE ${sql.unsafe(templateDbName)}`;
}

/**
 * Sets up the template database by applying migrations and marking it as a template.
 * @param dbUrl - The database URL to use.
 * @param migrationsDir - The directory containing the migrations to apply.
 * @param templateDbName - The name of the template database.
 * @returns The database configuration.
 */
async function initTemplateDatabase(
  dbUrl: string,
  migrationsDir: string,
  templateDbName: string,
) {
  const templateUrl = swapDatabaseInURL(dbUrl, templateDbName);
  const sql = postgres(templateUrl);
  const db = drizzle(sql);

  // Apply migrations
  await migrate(db, {
    migrationsFolder: migrationsDir,
  });

  // Mark the database as a template
  await sql`UPDATE pg_database SET datistemplate = true WHERE datname = '${sql.unsafe(templateDbName)}'`;

  return { sql, db };
}
