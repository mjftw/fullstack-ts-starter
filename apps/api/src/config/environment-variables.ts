import { z } from 'zod';

export const validationSchemaForEnv = z.object({
  DATABASE_URL: z.string().min(1),
  STATIC_FILES_PATH: z.string().min(1),
});

export type EnvironmentVariables = z.infer<typeof validationSchemaForEnv>;

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
