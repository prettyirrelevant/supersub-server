import { z } from 'zod';

const zEnv = z.object({
  ENVIRONMENT: z.enum(['development', 'production']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('debug'),
  DATABASE_URL: z.string().url().min(1),
  REDIS_URL: z.string().url().min(1),
  PORT: z.number().default(3456),
  SECRET_KEY: z.string().min(1),
});

const parsedEnv = zEnv.safeParse(process.env);
if (!parsedEnv.success) {
  throw new Error(`Unable to parse environment variables ${parsedEnv.error}`);
}

export const config = parsedEnv.data;
