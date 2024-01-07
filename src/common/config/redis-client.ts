import { type RedisClientOptions, createClient } from 'redis'
import logger from '@services/logger.js'
import { config } from './env.js'

const redisClientOptions: RedisClientOptions = {
	password: config.REDIS_CLIENT_PASSWORD,
	socket: {
		host: config.REDIS_CONNECTION_URL,
		port: config.REDIS_CLIENT_PORT
	}
}

export const redisClient = createClient(redisClientOptions)
await redisClient.connect()

redisClient.on('error', (error) => {
	logger.error(error.message)
})

process.once('SIGTERM', async () => {
	await redisClient.disconnect()
})
