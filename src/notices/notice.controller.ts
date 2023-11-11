import { Request, Response } from 'express';
import { HTTP_RESPONSE } from '../common/constants/http.constants.js';
import logger from '../services/logger.js';
import { getNoticeById, getSavedNotices } from './notice.service.js';
import { MongooseError } from 'mongoose';
import { redisClient } from '../common/config/redis-client.js';
import { CACHED_TIME, CACHE_KEY } from '../common/constants/cache.constants.js';

export const getNotices = async (req: Request, res: Response) => {
	const { limit, offset } = req.query;

	const notices = await getSavedNotices(limit, offset);
	await redisClient.setEx(CACHE_KEY, CACHED_TIME, JSON.stringify(notices));

	res.status(HTTP_RESPONSE.SUCCESS).json(notices);
};

export const getNotice = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (id == undefined) throw new Error('Notice Id not found');

		const notice = await getNoticeById(id);
		if (!notice)
			res
				.status(HTTP_RESPONSE.NOT_FOUND)
				.json({ message: 'notice not found.' });

		await redisClient.setEx(id, CACHED_TIME, JSON.stringify(notice));

		res.status(HTTP_RESPONSE.SUCCESS).json(notice);
	} catch (error) {
		if (error instanceof MongooseError) {
			logger.error(error.message);
			res
				.status(HTTP_RESPONSE.SERVER_ERROR)
				.json({ error: 'Notice not found' });
			return;
		}

		if (error instanceof Error) {
			logger.error(error.message);
			res.status(HTTP_RESPONSE.NOT_FOUND).json({ error: error.message });
			return;
		}
	}
};
