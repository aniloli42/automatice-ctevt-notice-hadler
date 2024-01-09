import mongoose from 'mongoose'
import { config } from './env.js'
import logger from '@services/logger.js'

const connectMongoDB = async () => {
	await mongoose.connect(config.MONGODB_CONNECTION_URL)
}

const connection = mongoose.connection
connection.on('open', () => {
	logger.info('Connected With Mongo DB')
})

connection.on('error', (error) => {
	logger.error(error.message)
})

export default connectMongoDB
