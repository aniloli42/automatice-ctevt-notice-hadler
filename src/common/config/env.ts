import { z } from 'zod'

const EnvParser = z.object({
	PORT: z.coerce.number().int().positive().default(8000),
	MONGODB_CONNECTION_URL: z.string(),

	FACEBOOK_API_BASE_URL: z.string(),
	FACEBOOK_PAGE_ID: z.string(),
	FACEBOOK_USER_ID: z.string(),

	WEBSITE_URL: z.string(),

	REDIS_CONNECTION_URL: z.string(),
	REDIS_CLIENT_PASSWORD: z.string(),
	REDIS_CLIENT_PORT: z.coerce.number().int().positive(),

	TRUST_PROXY_LEVEL: z.coerce.number().int().positive().default(1),
	LIMIT_INTERVAL: z.coerce.number().int().positive().default(60000),
	NO_OF_REQUESTS: z.coerce.number().int().positive().default(20),

	URL_SHORTNER_ACCESS_TOKEN: z.string()
})

type Config = z.infer<typeof EnvParser>

export const config: Config = EnvParser.parse(process.env)
