import { Router } from 'express';
import { noticeCacheMiddleware } from '../middleware/notice-cache.middleware.js';
import { checkNotice, getNotice, getNotices } from './notice.controller.js';

const router = Router();

router.route('/notice/check').get(checkNotice);

router.route('/v1/api/notices').get(noticeCacheMiddleware, getNotices);
router.route('/v1/api/notices/:id').get(noticeCacheMiddleware, getNotice);

export default router;
