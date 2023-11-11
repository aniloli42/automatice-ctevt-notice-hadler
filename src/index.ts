import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import connectMongoDB from './common/config/db.js';
import { config } from './common/config/env.js';
import noticeRoutes from './notices/notice.route.js';
import reviewNoticeAndPost from './notices/notice.service.js';
import logger from './services/logger.js';

const app = express();

app.use(
	cors({
		methods: 'GET',
		origin: '*',
	})
);

await connectMongoDB().then(() => setTimeout(reviewNoticeAndPost, 2000));

app.get('/', (req, res) => {
	res.redirect('/v1/api');
});

app.get('/v1/api', (req, res) =>
	res.send('Welcome To CTEVT NOTICE Handler Server')
);

app.use(noticeRoutes);

app.listen(config.PORT, () =>
	logger.info(`Server is live on port ${config.PORT}`)
);
