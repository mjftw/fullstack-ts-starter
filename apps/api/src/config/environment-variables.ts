import { z } from 'zod';

export const validationSchemaForEnv = z.object({
  DATABASE_URL: z.string().min(1),
  REACT_SSR_CLIENT_INDEX_HTML_PATH: z.string().min(1),
  REACT_SSR_SERVER_ENTRY_JS_PATH: z.string().min(1),
  REACT_SSR_CLIENT_STATIC_DIR: z.string().min(1),
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
