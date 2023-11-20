import { type Request } from 'express';
import { redisClient } from '../common/config/redis-client.js';
import { CACHE_KEY } from '../common/constants/cache.constants.js';
import logger from '../services/logger.js';

export const noticeCacheMiddleware = async (req: Request, res, next) => {
	try {
		const noticeId = req.params['id'];
		const cacheData = await redisClient.get(noticeId ?? CACHE_KEY);

		if (cacheData != undefined) {
			res.json(JSON.parse(cacheData));
			return;
		}

		next();
	} catch (error) {
		if (error instanceof Error) logger.error(error.message);
		next();
	}
};
