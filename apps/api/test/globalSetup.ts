import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import path from 'path';
import postgres from 'postgres';
import { swapDatabaseInURL } from 'src/database/utils';

const TEMPLATE_DB_NAME = 'template_database' as const;

export default async function setup() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const adminSql = postgres(process.env.DATABASE_URL);

  // Reset and create template database
  await resetTemplateDatabase(adminSql);
  await adminSql.end();

  // Setup and migrate template database
  const templateConfig = await setupTemplateDatabase(process.env.DATABASE_URL);
  await templateConfig.sql.end();
}

async function resetTemplateDatabase(sql: postgres.Sql) {
  // Need to set to not being a template database in order to delete it
  await sql`UPDATE pg_database SET datistemplate = false WHERE datname = '${sql.unsafe(TEMPLATE_DB_NAME)}'`;
  await sql`DROP DATABASE IF EXISTS ${sql.unsafe(TEMPLATE_DB_NAME)}`;
  await sql`CREATE DATABASE ${sql.unsafe(TEMPLATE_DB_NAME)}`;
}

async function setupTemplateDatabase(dbUrl: string) {
  const templateUrl = swapDatabaseInURL(dbUrl, TEMPLATE_DB_NAME);
  const sql = postgres(templateUrl);
  const db = drizzle(sql);

  await migrate(db, {
    migrationsFolder: path.join(__dirname, '..', 'drizzle'),
  });

  // Mark the database as a template
  await sql`UPDATE pg_database SET datistemplate = true WHERE datname = '${sql.unsafe(TEMPLATE_DB_NAME)}'`;

  return { sql, db };
}
