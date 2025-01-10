import { z } from 'zod';

export const validationSchemaForEnv = z.object({
  DATABASE_URL: z.string().min(1),
  REACT_STATIC_FILES_DIR: z.string().min(1),
  REACT_SSR_CLIENT_INDEX_HTML_PATH: z.string().min(1),
  REACT_SSR_SERVER_ENTRY_JS_PATH: z.string().min(1),
  REACT_SSR_CLIENT_STATIC_DIR: z.string().min(1),
  FOO: z.string().min(1),
  BAR: z.coerce.number(),
  ENVIRONMENT: z.enum(['local', 'deployed']),
  RABBITMQ_HOST: z.string().min(1),
  RABBITMQ_PORT: z.coerce.number(),
  RABBITMQ_USERNAME: z.string().min(1),
  RABBITMQ_PASSWORD: z.string().min(1),
  RABBITMQ_REQUIRE_TLS: z.string().transform((value) => value === 'true'),
  RABBITMQ_CREATE_CONSUMER_EXCHANGES: z.string().transform((value) => value === 'true'),
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
