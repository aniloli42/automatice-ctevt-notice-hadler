import compression from 'compression';
import cors, { CorsOptions } from 'cors';
import 'dotenv/config';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import connectMongoDB from './common/config/db.js';
import { config } from './common/config/env.js';
import {
	LIMIT_INTERVAL,
	NO_OF_REQUESTS,
} from './common/constants/app.constants.js';
import { calledRouteLogger } from './middleware/route-logger.js';
import noticeRoutes from './notices/notice.route.js';
import logger from './services/logger.js';
import { runNoticeCheckWorker } from './services/worker.js';

const app = express();

const corsOptions: CorsOptions = {
	methods: 'GET',
	origin: '*',
};

const rateLimiter = rateLimit({
	windowMs: LIMIT_INTERVAL,
	limit: NO_OF_REQUESTS,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
});

app.use(cors(corsOptions));
app.use(rateLimiter);
app.use(helmet());
app.use(compression());
app.use(calledRouteLogger);
app.set('trust proxy', config.TRUST_PROXY_LEVEL);

await connectMongoDB().then(async () => {
	runNoticeCheckWorker();
});

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
