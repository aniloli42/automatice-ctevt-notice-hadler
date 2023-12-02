import { schedule, type ScheduleOptions } from 'node-cron'
import { checkNewNoticesAndPost } from './notice.worker.js'
import { NOTICE_FETCH_CRON_JOB_SCHEDULE } from './notice.constants.js'

const taskOptions: ScheduleOptions = {
	scheduled: false, // to stop the task run automatically
	timezone: 'Asia/Kathmandu'
}

export const runNoticeCheck = schedule(
	NOTICE_FETCH_CRON_JOB_SCHEDULE,
	checkNewNoticesAndPost,
	taskOptions
)
