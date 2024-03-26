import type { NextFunction, Request, Response } from 'express'
import logger from '../services/logger.js'

export const logRouteRequestClient = (req: Request, _res: Response, next: NextFunction) => {
	const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
	logger.info(`${req.headers['user-agent']} ${req.originalUrl} from ${ip}`)
	next()
}
