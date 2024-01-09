import { redisClient } from '@common/config/redis-client'
import logger from '@services/logger'
import mongoose from 'mongoose'

export const gracefulShutdown = () => {
	process.on('SIGTERM', async () => {
		logger.info('Redis Connection Closed')
		await redisClient.disconnect()

		const connection = mongoose.connection
		connection.close()
		logger.info('Database Connection Closed')
		process.exit(0)
	})
}
