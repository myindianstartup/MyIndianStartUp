import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  FRONTEND_ORIGIN: z.string().default('http://localhost:3000,http://localhost:3001'),

  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),

  R2_ACCOUNT_ID: z.string().optional().default(''),
  R2_ENDPOINT: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional().default(''),
  R2_SECRET_ACCESS_KEY: z.string().optional().default(''),
  R2_BUCKET: z.string().optional().default(''),
  R2_PUBLIC_BASE_URL: z.string().optional().default(''),

  RAZORPAY_KEY_ID: z.string().optional().default(''),
  RAZORPAY_KEY_SECRET: z.string().optional().default(''),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(''),

  MAX_IMAGE_MB: z.coerce.number().default(5),
  MAX_VIDEO_MB: z.coerce.number().default(50),
  FFMPEG_PATH: z.string().optional()
});

export const env = envSchema.parse(process.env);

if (!env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[WARN] SUPABASE_SERVICE_ROLE_KEY is not set - admin routes and server-side DB writes will fail.');
}
if (!env.R2_ACCESS_KEY_ID) {
  console.warn('[WARN] R2 credentials are not set - media upload endpoints will return 503.');
}
if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
  console.warn('[WARN] Razorpay credentials are not set - paid checkout will be unavailable.');
}

export const frontendOrigins = env.FRONTEND_ORIGIN
  .split(',')
  .map((value) => value.trim().replace(/\/+$/, ''))
  .filter(Boolean);
