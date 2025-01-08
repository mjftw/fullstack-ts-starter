import path from 'path';
import { setupTemplateDatabase } from './utils/templateDb';

/** Vitest global setup function. Runs once before all tests. */
export default async function setup() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const migrationsDir = path.join(__dirname, '..', 'drizzle');

  await setupTemplateDatabase(process.env.DATABASE_URL, migrationsDir);
}
