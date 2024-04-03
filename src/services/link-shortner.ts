import { config } from '@common/config/env'
import axios, { AxiosError } from 'axios'
import logger from './logger'

export const linkShortner = async (url: string) => {
	try {
		if (!url) throw new Error('link invalid')
		const res = await axios.post(
			`https://api-ssl.bitly.com/v4/shorten`,
			{ long_url: url },
			{
				headers: {
					'Content-Type': 'application/json',
					authorization: `Bearer ${config.URL_SHORTNER_ACCESS_TOKEN}`
				}
			}
		)

		const { link } = await res.data
		return link as string
	} catch (e: unknown) {
		if (e instanceof AxiosError)
			logger.error(e.response?.data.message ?? 'Something went wrong')
		if (e instanceof Error) logger.error(e.message)
		return url
	}
}
