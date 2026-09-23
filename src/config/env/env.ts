import Config from 'react-native-config';
import { z } from 'zod';

const EnvSchema = z.object({
  APP_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
  APP_DISPLAY_NAME: z.string().default('Explora'),
  /** Deep-link scheme without "://" (explora-dev, explora-staging, explora). */
  APP_URL_SCHEME: z
    .string()
    .regex(/^[a-z][a-z0-9+.-]*$/)
    .default('explora'),
  API_URL: z.string().default(''),
  API_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  DEV_SEED_MULTIPLIER: z.coerce.number().int().min(0).default(0),
});

export type Env = z.infer<typeof EnvSchema>;
/** @public */
export type AppEnv = Env['APP_ENV'];

/** Validated once at startup; fails fast with a readable error instead of undefined at runtime. */
export const env: Env = EnvSchema.parse(Config ?? {});

/** @public */
export const isProduction = env.APP_ENV === 'production';
