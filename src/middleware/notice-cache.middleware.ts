import { type NextFunction, type Request, type Response } from 'express'
import { redisClient } from '../common/config/redis-client.js'
import { NOTICES_CACHE_KEY } from '../common/constants/cache.constants.js'
import { getPaginatedCacheKey } from '../common/utils/getPaginatedCacheKey.js'
import logger from '../services/logger.js'

export const noticeCacheMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const noticeId = req.params['id']
		const { page, limit } = req.query

		const cacheKey = getPaginatedCacheKey({
			limit,
			page,
			initialKey: NOTICES_CACHE_KEY
		})

		const cacheData = await redisClient.get(noticeId ?? cacheKey)
		if (cacheData != undefined) {
			res.json(JSON.parse(cacheData))
			return
		}

		next()
	} catch (error) {
		if (error instanceof Error) logger.error(error.message)
		next()
	}
}
