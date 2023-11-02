import { Router } from 'express';
import { getNoticeById, getNotices } from '../controllers/notice.controller.js';

const router = Router();

router.route('/v1/api/notices').get(getNotices);

router.route('/v1/api/notices/:id').get(getNoticeById);

export default router;
