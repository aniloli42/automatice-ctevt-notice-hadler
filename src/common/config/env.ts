const parseNumberOrDefault = <T>(value: string | undefined, defaultValue: T) =>
	parseInt(value ?? '') || defaultValue;

const config = {
	// eslint-disable-next-line no-magic-numbers
	PORT: parseNumberOrDefault(process.env.PORT, 8000),

	MONGODB_CONNECTION_URL: process.env.MONGODB_CONNECTION_URL!,

	FACEBOOK_API_BASE_URL: process.env.FACEBOOK_API_BASE_URL!,
	FACEBOOK_PAGE_ID: process.env.FACEBOOK_PAGE_ID!,
	FACEBOOK_USER_ID: process.env.FACEBOOK_USER_ID!,

	WEBSITE_URL: process.env.WEBSITE_URL!,

	REDIS_CONNECTION_URL: process.env.REDIS_CONNECTION_URL!,
	REDIS_CLIENT_PASSWORD: process.env.REDIS_CLIENT_PASSWORD!,
	REDIS_CLIENT_PORT: parseNumberOrDefault(
		process.env.REDIS_CLIENT_PORT,
		undefined
	),

	TRUST_PROXY_LEVEL: parseNumberOrDefault(process.env.TRUST_PROXY_LEVEL, 1),
	LIMIT_INTERVAL: parseNumberOrDefault(process.env.LIMIT_INTERVAL, 60000),
	NO_OF_REQUESTS: parseNumberOrDefault(process.env.NO_OF_REQUESTS, 20),
} as const;

const isEnvWithoutValues = Object.values(config).some(
	(env) => env == undefined
);

if (isEnvWithoutValues) {
	const envWithoutValues = [...Object.entries(config)].reduce(
		(noValueEnvs: string[], [key, value]) => {
			if (value == undefined) noValueEnvs.push(key);
			return noValueEnvs;
		},
		[]
	);

	const errorMessage = `Env without values: ${envWithoutValues.join(', ')}`;
	throw new Error(errorMessage);
}

export { config };
