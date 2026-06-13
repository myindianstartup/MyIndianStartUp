import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY
  }
});

export const uploadToR2 = async ({ key, body, contentType }) => {
  await r2.send(new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType
  }));

  return `${env.R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`;
};

export const deleteFromR2 = async (key) => {
  await r2.send(new DeleteObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key
  }));
};
