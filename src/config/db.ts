import mongoose from 'mongoose';
import { config } from './env.js';
import logger from '../utils/logger.js';

const connectMongoDB = () => {
	mongoose.connect(config.MONGODB_CONNECTION_URL);

	mongoose.connection.on('error', (err) => {
		if (err) throw new Error(err);
	});

	mongoose.connection.on('open', () => {
		logger.info('Connected With Mongo DB');
	});
};

export default connectMongoDB;
