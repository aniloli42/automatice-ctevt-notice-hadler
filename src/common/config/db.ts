import mongoose from 'mongoose';
import { config } from './env.js';
import logger from '../../services/logger.js';

const connectMongoDB = async () => {
	mongoose.connect(config.MONGODB_CONNECTION_URL);

	const connection = mongoose.connection;

	connection.on('open', () => {
		logger.info('Connected With Mongo DB');
	});

	connection.on('error', (error) => {
		logger.error(error.message);
	});

	process.once('SIGTERM', async () => {
		await connection.close();
		logger.info('Database Connection Closed');
		process.exit(1);
	});
};

export default connectMongoDB;
