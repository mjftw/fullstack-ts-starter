import type { Config } from 'drizzle-kit';
import { validateEnv } from './src/config/environment-variables';

// Validate environment variables
const validatedEnv = validateEnv(process.env);

export default {
  schema: './src/persistence/drizzle/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: validatedEnv.DATABASE_URL,
  },
} satisfies Config;
