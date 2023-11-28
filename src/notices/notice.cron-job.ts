import { schedule } from 'node-cron';
import { checkNewNoticesAndPost } from './notice.worker.js';
import { NOTICE_FETCH_CRON_JOB_SCHEDULE } from './notice.constants.js';

const taskOptions = {
	scheduled: true,
	timezone: 'Asia/Kathmandu',
};

export const runNoticeCheck = schedule(
	NOTICE_FETCH_CRON_JOB_SCHEDULE,
	checkNewNoticesAndPost,
	taskOptions
);
