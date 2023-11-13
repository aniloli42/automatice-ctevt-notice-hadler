import { Worker } from 'worker_threads';
import logger from './logger.js';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import EventEmitter from 'events';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const NOTICE_WORKER_PATH = resolve(__dirname, '../notices/notice.worker.js');

export const checkNoticeEvent = new EventEmitter();
checkNoticeEvent.on('checkNotice', () => {
	runNoticeCheckWorker();
});

const runNoticeCheckWorker = () => {
	const worker = new Worker(NOTICE_WORKER_PATH, {
		workerData: null,
	});

	worker.once('exit', () => logger.info('Notice checking process exited'));

	worker.on('error', (error) => {
		logger.error({ error });
	});
};
