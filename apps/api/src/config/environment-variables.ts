import { z } from 'zod';

export interface EnvironmentVariables {
  DATABASE_URL: string;
}

export const validationSchemaForEnv = z.object({
  DATABASE_URL: z.string().min(1),
});

export function validateEnv(config: Record<string, unknown>) {
  const result = validationSchemaForEnv.safeParse(config);

  if (!result.success) {
    console.error(
      '❌ Invalid environment variables:\n',
      result.error.errors
        .map((error) => `  - ${error.path.join('.')}: ${error.message}`)
        .join('\n'),
    );
    throw new Error('Invalid environment variables');
  }

  return result.data;
}
