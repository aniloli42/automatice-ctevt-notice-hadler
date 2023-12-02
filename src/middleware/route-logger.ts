import type { Request, Response } from 'express'
import logger from '../services/logger.js'

export const calledRouteLogger = (req: Request, res: Response, next) => {
	const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
	logger.info(`${req.headers['user-agent']} ${req.originalUrl} from ${ip}`)
	next()
}
