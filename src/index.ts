import connectMongoDB from '@common/config/db.js'
import { config } from '@common/config/env.js'
import {
  LIMIT_INTERVAL,
  NO_OF_REQUESTS
} from '@common/constants/app.constants.js'
import { GREET } from '@common/constants/greet.constants'
import { gracefulShutdown } from '@common/utils/gracefulShutdown'
import { logRouteRequestClient } from '@middleware/route-logger.js'
import { runNoticeCheck } from '@notices/notice.cron-job.js'
import noticeRoutes from '@notices/notice.route.js'
import logger from '@services/logger.js'
import compression from 'compression'
import cors, { type CorsOptions } from 'cors'
import 'dotenv/config'
import express, { type Request, type Response } from 'express'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'

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
app.use(logRouteRequestClient)

gracefulShutdown()
await connectMongoDB()

if (process.env.NODE_ENV !== 'production') runNoticeCheck.start()

const routeGuides = (_: Request, res: Response) => {
  res.json(GREET)
}

app.get('/', routeGuides)
app.use(noticeRoutes)

const runningServerLog = () =>
  logger.info(`Server is live on port ${config.PORT}`)
app.listen(config.PORT, runningServerLog)
