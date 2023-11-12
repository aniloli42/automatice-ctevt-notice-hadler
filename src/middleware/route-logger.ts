import { Request } from 'express';
import logger from '../services/logger.js';

export const calledRouteLogger = (req: Request, res, next) => {
	logger.info(`${req.headers['user-agent']} ${req.originalUrl}`);
	next();
};
