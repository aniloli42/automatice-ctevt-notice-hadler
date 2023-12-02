import { Router } from 'express'
import { noticeCacheMiddleware } from '../middleware/notice-cache.middleware.js'
import { getNotice, getNotices } from './notice.controller.js'

const router = Router()

router.route('/v1/api/notices').get(noticeCacheMiddleware, getNotices)
router.route('/v1/api/notices/:id').get(noticeCacheMiddleware, getNotice)

export default router
