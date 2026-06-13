import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { uploadMediaAsset } from '../services/mediaService.js';

const upload = multer({ storage: multer.memoryStorage() });
const uploadSchema = z.object({
  purpose: z.enum(['profile', 'post'])
});

export const mediaRouter = Router();

mediaRouter.post('/upload', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const { purpose } = uploadSchema.parse(req.body);
    const asset = await uploadMediaAsset({ file: req.file, userId: req.user.id, purpose });

    res.status(201).json({ asset });
  } catch (error) {
    next(error);
  }
});
