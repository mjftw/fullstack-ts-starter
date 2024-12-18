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
    throw new Error(result.error.toString());
  }

  return result.data;
}
