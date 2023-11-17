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

const app = express();
const corsOptions: CorsOptions = {
	methods: 'GET',
	origin: '*',
};

const rateLimiter = rateLimit({
	windowMs: LIMIT_INTERVAL,
	limit: NO_OF_REQUESTS,
	legacyHeaders: false,
	standardHeaders: true,
	validate: {
		default: true,
	},
	skip: (req) => req.path === '/v1/api',
});

app.set('trust proxy', 3);
app.use(cors(corsOptions));
app.use(rateLimiter);
app.use(helmet());
app.use(compression());
app.use(calledRouteLogger);

await connectMongoDB();

app.get('/', (req, res) => {
	res.send('Welcome To CTEVT NOTICE Handler Server');
});
app.get('/api', (req, res) =>
	res.json({
		headers: req.headers,
		ip: req.ip,
		i: req.socket.remoteAddress,
		headerIp: req.headers['x-forwarded-for'],
	})
);

app.use(noticeRoutes);

app.listen(config.PORT, () =>
	logger.info(`Server is live on port ${config.PORT}`)
);
