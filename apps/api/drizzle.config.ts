import type { Config } from 'drizzle-kit';

export default {
  schema: './src/persistence/drizzle/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // TODO: use config service
    url: process.env.DATABASE_URL,
  },
} satisfies Config;
