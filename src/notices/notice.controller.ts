import type { Request, Response } from 'express'
import { MongooseError } from 'mongoose'
import { redisClient } from '../common/config/redis-client.js'
import {
	CACHED_TIME,
	NOTICES_CACHE_KEY
} from '../common/constants/cache.constants.js'
import { HTTP_RESPONSE } from '../common/constants/http.constants.js'
import { getPaginatedCacheKey } from '../common/utils/getPaginatedCacheKey.js'
import logger from '../services/logger.js'
import { getNoticeById, getSavedNotices } from './notice.service.js'
import { checkNewNoticesAndPost } from './notice.worker.js'

export const getNotices = async (req: Request, res: Response) => {
	console.log(req.query)
	const { limit, page } = req.query
	const cacheKey = getPaginatedCacheKey({
		page,
		limit,
		initialKey: NOTICES_CACHE_KEY
	})

	const notices = await getSavedNotices(limit, page)
	await redisClient.setEx(cacheKey, CACHED_TIME, JSON.stringify(notices))

	res.status(HTTP_RESPONSE.SUCCESS).json(notices)
}

export const getNotice = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		if (id == undefined) throw new Error('Notice Id not found')

		const notice = await getNoticeById(id)
		if (!notice)
			res.status(HTTP_RESPONSE.NOT_FOUND).json({
				message: 'notice not found.'
			})

		await redisClient.setEx(id, CACHED_TIME, JSON.stringify(notice))

		res.status(HTTP_RESPONSE.SUCCESS).json(notice)
	} catch (error) {
		if (error instanceof MongooseError) {
			logger.error(error.message)
			res.status(HTTP_RESPONSE.SERVER_ERROR).json({
				error: 'Notice not found'
			})
			return
		}

		if (error instanceof Error) {
			logger.error(error.message)
			res.status(HTTP_RESPONSE.NOT_FOUND).json({ error: error.message })
			return
		}
	}
}

export const checkNotice = async (req: Request, res: Response) => {
	try {
		logger.info('Check Notice Triggered')
		res.status(HTTP_RESPONSE.SUCCESS).json({
			message: 'Check Notice Triggered'
		})
	} finally {
		await checkNewNoticesAndPost()
	}
}
