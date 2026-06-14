import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import sharp from 'sharp';
import { env } from '../config/env.js';
import { uploadToR2 } from '../lib/r2.js';
import { supabaseAdmin } from '../lib/supabase.js';

const execFileAsync = promisify(execFile);
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

  const maxWidth = purpose === 'profile' ? 640 : purpose === 'story' ? 720 : 1280;
  const maxHeight = purpose === 'profile' ? 640 : purpose === 'story' ? 1280 : 1280;
  const quality = purpose === 'profile' ? 78 : purpose === 'story' ? 64 : 72;

  const buffer = await sharp(file.buffer)
    .rotate()
    .resize({ width: maxWidth, height: maxHeight, fit: 'inside', withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  return {
    buffer,
    contentType: 'image/webp',
    extension: '.webp',
    sizeBytes: buffer.length
  };
};

export const prepareVideo = async (file, purpose = 'post') => {
  assertFileSize(file, 'video');

  const ffmpegPath = env.FFMPEG_PATH || 'ffmpeg';
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mis-video-'));
  const inputPath = path.join(tempDir, `input${extensionFromMime(file.mimetype) || path.extname(file.originalname) || '.mp4'}`);
  const outputPath = path.join(tempDir, 'optimized.mp4');

  const maxWidth = purpose === 'story' ? 720 : 1280;
  const crf = purpose === 'story' ? '31' : '28';

  try {
    await fs.writeFile(inputPath, file.buffer);
    await execFileAsync(ffmpegPath, [
      '-y',
      '-i',
      inputPath,
      '-vf',
      `scale='min(${maxWidth},iw)':-2`,
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      crf,
      '-c:a',
      'aac',
      '-b:a',
      '96k',
      '-movflags',
      '+faststart',
      outputPath
    ], { timeout: 120000, maxBuffer: 10 * 1024 * 1024 });

    const optimizedBuffer = await fs.readFile(outputPath);
    if (optimizedBuffer.length > 0 && optimizedBuffer.length < file.size) {
      return {
        buffer: optimizedBuffer,
        contentType: 'video/mp4',
        extension: '.mp4',
        sizeBytes: optimizedBuffer.length
      };
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Video optimization skipped:', error.message);
    }
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }

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
  const prepared = isImage ? await prepareImage(file, purpose) : await prepareVideo(file, purpose);
  const folder = purpose === 'profile'
    ? 'profiles'
    : purpose === 'story'
      ? `stories/${new Date().getFullYear()}`
      : `posts/${new Date().getFullYear()}`;
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
