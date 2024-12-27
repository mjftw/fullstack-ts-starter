import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import path from 'path';
import postgres from 'postgres';
import { swapDatabaseInURL } from 'src/database/utils';

export default async function setup() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const adminSql = postgres(process.env.DATABASE_URL);

  console.log('Creating fresh template database...');

  // Create a fresh template database
  await adminSql`UPDATE pg_database SET datistemplate = false WHERE datname = 'template_database';`;
  await adminSql`DROP DATABASE IF EXISTS template_database;`;
  await adminSql`CREATE DATABASE template_database;`;

  console.log('Template database created');

  await adminSql.end();

  const templateDatabaseUrl = swapDatabaseInURL(
    process.env.DATABASE_URL,
    'template_database',
  );
  const templateSql = postgres(templateDatabaseUrl);
  const templateDB = drizzle(templateSql);

  console.log('Applying migrations to template database...');

  await migrate(templateDB, {
    migrationsFolder: path.join(__dirname, '..', 'drizzle'),
  });

  console.log('Migrations applied');

  console.log('Marking template database as template...');

  await templateSql`UPDATE pg_database SET datistemplate = true WHERE datname = 'template_database';`;

  console.log('Template database marked as template');

  templateSql.end();
}
