import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  FRONTEND_ORIGIN: z.string().default('http://localhost:3000,http://localhost:3001'),

  // Supabase — required for core functionality
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Cloudflare R2 — optional; media upload will return 503 if not configured
  R2_ACCOUNT_ID: z.string().optional().default(''),
  R2_ENDPOINT: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional().default(''),
  R2_SECRET_ACCESS_KEY: z.string().optional().default(''),
  R2_BUCKET: z.string().optional().default(''),
  R2_PUBLIC_BASE_URL: z.string().optional().default(''),

  // Upload limits
  MAX_IMAGE_MB: z.coerce.number().default(5),
  MAX_VIDEO_MB: z.coerce.number().default(50),
  FFMPEG_PATH: z.string().optional()
});

export const env = envSchema.parse(process.env);

export const frontendOrigins = env.FRONTEND_ORIGIN
  .split(',')
  .map((value) => value.trim().replace(/\/+$/, ''))
  .filter(Boolean);
