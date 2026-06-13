import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';

export const r2 = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT || `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY
  }
});

export const uploadToR2 = async ({ key, body, contentType }) => {
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
  await r2.send(new DeleteObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key
  }));
};
