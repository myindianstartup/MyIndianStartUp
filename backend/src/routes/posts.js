import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { uploadMediaAsset } from '../services/mediaService.js';

const upload = multer({ storage: multer.memoryStorage() });

const postSchema = z.object({
  caption: z.string().trim().min(1).max(500),
  accountType: z.enum(['business', 'creator'])
});

export const postsRouter = Router();

postsRouter.get('/feed', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .schema('postverse')
      .from('posts')
      .select('id, author_id, account_type, caption, media_url, media_type, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json({ posts: data });
  } catch (error) {
    next(error);
  }
});

postsRouter.post('/', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image or video file is required' });
    }

    const payload = postSchema.parse(req.body);

    const { data: member, error: memberError } = await supabaseAdmin
      .schema('core')
      .from('members')
      .select('subscription_status, subscription_expires_at')
      .eq('id', req.user.id)
      .maybeSingle();

    if (memberError) throw memberError;

    const subscriptionExpired = member?.subscription_expires_at
      ? new Date(member.subscription_expires_at) <= new Date()
      : true;

    if (!member || member.subscription_status !== 'active' || subscriptionExpired) {
      return res.status(402).json({ error: 'Active annual membership is required before publishing posts' });
    }

    const { data: lastPost, error: lastPostError } = await supabaseAdmin
      .schema('postverse')
      .from('posts')
      .select('created_at')
      .eq('author_id', req.user.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastPostError) throw lastPostError;

    if (lastPost) {
      const nextAllowedAt = new Date(new Date(lastPost.created_at).getTime() + 24 * 60 * 60 * 1000);
      if (nextAllowedAt > new Date()) {
        return res.status(429).json({
          error: 'You can publish only one post every 24 hours',
          nextAllowedAt
        });
      }
    }

    const { data: post, error: postError } = await supabaseAdmin
      .schema('postverse')
      .from('posts')
      .insert({
        author_id: req.user.id,
        account_type: payload.accountType,
        caption: payload.caption,
        status: 'uploading'
      })
      .select('*')
      .single();

    if (postError) throw postError;

    const asset = await uploadMediaAsset({
      file: req.file,
      userId: req.user.id,
      purpose: 'post',
      postId: post.id
    });

    const { data: publishedPost, error: publishError } = await supabaseAdmin
      .schema('postverse')
      .from('posts')
      .update({
        media_asset_id: asset.id,
        media_url: asset.public_url,
        media_type: asset.media_type,
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', post.id)
      .select('*')
      .single();

    if (publishError) throw publishError;

    res.status(201).json({ post: publishedPost, asset });
  } catch (error) {
    next(error);
  }
});
