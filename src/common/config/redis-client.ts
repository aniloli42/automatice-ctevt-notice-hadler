import {
    type RedisClientOptions,
	type RedisFunctions,
	type RedisModules,
	type RedisScripts,
	createClient,
} from 'redis';
import logger from '../../services/logger.js';
import { config } from './env.js';

type TRedisClientOptions = RedisClientOptions<
	RedisModules,
	RedisFunctions,
	RedisScripts
>;

const redisClientOptions: TRedisClientOptions = {
	password: config.REDIS_CLIENT_PASSWORD,
	socket: {
		host: config.REDIS_CONNECTION_URL,
		port: config.REDIS_CLIENT_PORT,
	},
};

const redisClient = createClient(redisClientOptions);
await redisClient.connect();

redisClient.on('error', (error) => {
	logger.error(error.message);
});

process.once('SIGTERM', async () => {
	await redisClient.disconnect();
});

export { redisClient };
