import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';

export const isR2Configured = () =>
  Boolean(env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET && env.R2_PUBLIC_BASE_URL);

export const r2 = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT || (env.R2_ACCOUNT_ID ? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : 'https://placeholder.r2.cloudflarestorage.com'),
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID || 'placeholder',
    secretAccessKey: env.R2_SECRET_ACCESS_KEY || 'placeholder'
  }
});

export const uploadToR2 = async ({ key, body, contentType }) => {
  if (!isR2Configured()) {
    const error = new Error('Media storage is not configured. Please set R2 environment variables.');
    error.status = 503;
    throw error;
  }

  try {
    await r2.send(new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType
    }));
  } catch (error) {
    const uploadError = new Error('Media storage upload failed. Check Cloudflare R2 endpoint, bucket name, API token permissions, and public bucket URL.');
    uploadError.status = 502;
    uploadError.cause = error;
    throw uploadError;
  }

  return `${env.R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`;
};

export const deleteFromR2 = async (key) => {
  if (!isR2Configured()) {
    const error = new Error('Media storage is not configured. Please set R2 environment variables.');
    error.status = 503;
    throw error;
  }

  await r2.send(new DeleteObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key
  }));
};
