import { createLogger, format, transports } from 'winston';

const loggingFormat = format.printf(
	({ level, message }) => `[${level}] ${message}`
);

const logger = createLogger({
	format: format.combine(loggingFormat),
	transports: [
		new transports.Console(),
		new transports.File({
			filename: 'notice.log',
			level: 'info',
		}),
	],
});

export default logger;
