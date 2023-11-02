import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import connectMongoDB from './config/db.js';
import { config } from './config/env.js';
import noticeRoutes from './routes/notice.route.js';
import reviewNoticeAndPost from './controllers/notice.controller.js';

const app = express();

app.use(
	cors({
		methods: 'GET',
		origin: '*',
	})
);

connectMongoDB();

setTimeout(reviewNoticeAndPost, 5000);

app.get('/v1/api', async (_, res) =>
	res.send('Welcome To CTEVT NOTICE Handler Server')
);

app.use(noticeRoutes);

app.listen(config.PORT, () => console.log(`Server is live on ${config.PORT}`));
