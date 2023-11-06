import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import connectMongoDB from './config/db.js';
import { config } from './config/env.js';
import noticeRoutes from './routes/notice.route.js';
import reviewNoticeAndPost from './controllers/notice.controller.js';
import logger from './utils/logger.js';

const app = express();

app.use(
	cors({
		methods: 'GET',
		origin: '*',
	})
);

connectMongoDB();

const NOTICE_TRIGGER_AT = 5000;
setTimeout(reviewNoticeAndPost, NOTICE_TRIGGER_AT);

app.get('/', (_, res) => {
	res.redirect('/v1/api');
});

app.get('/v1/api', (_, res) =>
	res.send('Welcome To CTEVT NOTICE Handler Server')
);

app.use(noticeRoutes);

app.listen(config.PORT, () =>
	logger.info(`Server is live on port ${config.PORT}`)
);
