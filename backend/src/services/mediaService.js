import crypto from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import { env } from '../config/env.js';
import { uploadToR2 } from '../lib/r2.js';
import { supabaseAdmin } from '../lib/supabase.js';

const imageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const videoMimeTypes = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

const extensionFromMime = (mimeType) => {
  if (mimeType === 'image/jpeg') return '.jpg';
  if (mimeType === 'image/png') return '.png';
  if (mimeType === 'image/webp') return '.webp';
  if (mimeType === 'video/mp4') return '.mp4';
  if (mimeType === 'video/webm') return '.webm';
  if (mimeType === 'video/quicktime') return '.mov';
  return '';
};

const assertFileSize = (file, type) => {
  const maxMb = type === 'video' ? env.MAX_VIDEO_MB : env.MAX_IMAGE_MB;
  const maxBytes = maxMb * 1024 * 1024;

  if (file.size > maxBytes) {
    const error = new Error(`${type} exceeds ${maxMb}MB limit`);
    error.status = 413;
    throw error;
  }
};

export const prepareImage = async (file, purpose) => {
  assertFileSize(file, 'image');

  const maxWidth = purpose === 'profile' ? 640 : 1280;
  const maxHeight = purpose === 'profile' ? 640 : 1280;

  const buffer = await sharp(file.buffer)
    .rotate()
    .resize({ width: maxWidth, height: maxHeight, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: purpose === 'profile' ? 78 : 72 })
    .toBuffer();

  return {
    buffer,
    contentType: 'image/webp',
    extension: '.webp',
    sizeBytes: buffer.length
  };
};

export const prepareVideo = async (file) => {
  assertFileSize(file, 'video');

  // Keep backend lightweight for free-tier deployments. Video transcoding should run
  // in a background worker later; for now, enforce size/type and upload the original.
  return {
    buffer: file.buffer,
    contentType: file.mimetype,
    extension: extensionFromMime(file.mimetype),
    sizeBytes: file.size
  };
};

export const uploadMediaAsset = async ({ file, userId, purpose, postId = null }) => {
  const isImage = imageMimeTypes.has(file.mimetype);
  const isVideo = videoMimeTypes.has(file.mimetype);

  if (!isImage && !isVideo) {
    const error = new Error('Unsupported media type');
    error.status = 400;
    throw error;
  }

  const mediaType = isImage ? 'image' : 'video';
  const prepared = isImage ? await prepareImage(file, purpose) : await prepareVideo(file);
  const folder = purpose === 'profile' ? 'profiles' : `posts/${new Date().getFullYear()}`;
  const key = `${folder}/${userId}/${crypto.randomUUID()}${prepared.extension || path.extname(file.originalname)}`;
  const publicUrl = await uploadToR2({ key, body: prepared.buffer, contentType: prepared.contentType });

  const { data, error } = await supabaseAdmin
    .schema('core')
    .from('media_assets')
    .insert({
      owner_id: userId,
      post_id: postId,
      purpose,
      media_type: mediaType,
      bucket: env.R2_BUCKET,
      object_key: key,
      public_url: publicUrl,
      mime_type: prepared.contentType,
      size_bytes: prepared.sizeBytes
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
};
