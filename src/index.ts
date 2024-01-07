import compression from 'compression'
import cors, { type CorsOptions } from 'cors'
import 'dotenv/config'
import express, { type Request, type Response } from 'express'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import connectMongoDB from '@common/config/db.js'
import { config } from '@common/config/env.js'
import {
	LIMIT_INTERVAL,
	NO_OF_REQUESTS
} from '@common/constants/app.constants.js'
import { calledRouteLogger } from '@middleware/route-logger.js'
import { runNoticeCheck } from '@notices/notice.cron-job.js'
import noticeRoutes from '@notices/notice.route.js'
import logger from '@services/logger.js'

const app = express()
const corsOptions: CorsOptions = {
	methods: 'GET',
	origin: '*'
}

const rateLimiter = rateLimit({
	windowMs: LIMIT_INTERVAL,
	limit: NO_OF_REQUESTS,
	legacyHeaders: false,
	standardHeaders: true,
	validate: {
		default: true
	}
})

app.set('trust proxy', config.TRUST_PROXY_LEVEL)
app.use(cors(corsOptions))
app.use(rateLimiter)
app.use(helmet())
app.use(compression())
app.use(calledRouteLogger)

connectMongoDB()
if (process.env.NODE_ENV !== 'production') runNoticeCheck.start()

const routeGuides = (req: Request, res: Response) => {
	res.json({
		greeting: 'Welcome to CTEVT Notice Automation Server',
		endpoints: {
			'Get Notices': '/v1/api/notices',
			'Get Notices with Pagination':
				'/v1/api/notices/?page={page_no}&limit={no_of_notice}',
			'Get Notice': '/v1/api/notices/{noticeId}'
		}
	})
}

app.get('/', routeGuides)
app.use(noticeRoutes)

const runningServerLog = () =>
	logger.info(`Server is live on port ${config.PORT}`)
app.listen(config.PORT, runningServerLog)
