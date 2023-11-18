import { Router } from 'express';
import { noticeCacheMiddleware } from '../middleware/notice-cache.middleware.js';
import { getNotice, getNotices } from './notice.controller.js';
import { checkNewNoticesAndPost } from './notice.worker.js';

const router = Router();

router.route('/notice/check').get(checkNewNoticesAndPost);

router.route('/v1/api/notices').get(noticeCacheMiddleware, getNotices);
router.route('/v1/api/notices/:id').get(noticeCacheMiddleware, getNotice);

export default router;
