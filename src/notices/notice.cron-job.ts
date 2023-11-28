import { schedule } from 'node-cron';
import { checkNewNoticesAndPost } from './notice.worker.js';


const taskOptions = {
  scheduled: true,
  timezone: 'Asia/Kathmandu'
};

const task = () => {
  checkNewNoticesAndPost();
};


export const runNoticeCheck = schedule('*/10 6-20 * * *', task, taskOptions);
