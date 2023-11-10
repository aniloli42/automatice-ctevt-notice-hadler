import axios, { AxiosError } from 'axios';
import Token from './token.model.js';
import { config } from './../../common/config/env.js';
import logger from '../logger.js';
const MILLISECOND_IN_SECOND = 1000;

const getPageAccessToken = async () => {
	try {
		const pageAccessToken = await Token.findOne({
			token_type: 'page_access_token',
		});

		const currentTime = Date.now() / MILLISECOND_IN_SECOND;

		if (!pageAccessToken) return generatePageAccessToken();

		if (pageAccessToken.expires_in < currentTime)
			return generatePageAccessToken();

		return pageAccessToken.access_token;
	} catch (error) {
		logger.error(error);
	}
};

const requestPageInformation = async () => {
	try {
		const accessToken = await getPageAccessToken();

		const feedURL = new URL(
			`/v18.0/${config.FACEBOOK_PAGE_ID}`,
			config.FACEBOOK_API_BASE_URL
		);

		const searchParams = new URLSearchParams();
		searchParams.set('fields', 'id,name,followers_count');

		feedURL.search = searchParams.toString();

		const response = await axios.get(feedURL.href, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
		});

		return response.data;
	} catch (error: unknown) {
		if (error instanceof AxiosError) return error.response?.data;
		return error;
	}
};

type CreatePost = {
	message: string;
};

const createPost = async ({ message }: CreatePost) => {
	try {
		const pageAccessToken = await getPageAccessToken();

		const postNoticeURL = new URL(
			`/v18.0/${config.FACEBOOK_PAGE_ID}/feed`,
			config.FACEBOOK_API_BASE_URL
		);

		const noticePostResponse = await axios.post(
			postNoticeURL.href,
			{ message, published: true },
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${pageAccessToken}`,
				},
			}
		);

		const noticePostResponseData = await noticePostResponse.data;

		return noticePostResponseData.id;
	} catch (error) {
		logger.error(error);
	}
};

const generatePageAccessToken = async () => {
	try {
		const userAccessToken = await getUserAccessToken();
		const newPageAccessToken = await getNewPageAccessToken(userAccessToken);

		const pageAccessTokenExpiresAt = await getPageAccessTokenExpiresAt(
			newPageAccessToken,
			userAccessToken
		);

		await saveOrUpdatePageAccessToken(
			newPageAccessToken,
			pageAccessTokenExpiresAt
		);

		return newPageAccessToken;
	} catch (error) {
		logger.error(error);
	}
};

const getUserAccessToken = async () => {
	const userAccessToken = await Token.findOne({
		token_type: 'user_access_token',
	});

	if (!userAccessToken) throw new Error('User Access Token Not Found!!!');

	const currentTime = Date.now() / MILLISECOND_IN_SECOND;
	if (userAccessToken.expires_in < currentTime)
		throw new Error('User Access Token Expired');

	return userAccessToken.access_token;
};

const getNewPageAccessToken = async (userAccessToken: string) => {
	const pageAccessTokenGetURL = new URL(
		`/${config.FACEBOOK_USER_ID}/accounts`,
		config.FACEBOOK_API_BASE_URL
	);
	const pageAccessTokenGetSearchParams = new URLSearchParams();

	pageAccessTokenGetSearchParams.set('access_token', userAccessToken);
	pageAccessTokenGetURL.search = pageAccessTokenGetSearchParams.toString();

	const accessTokenResponse = await axios
		.get(pageAccessTokenGetURL.href)
		.then((res) => res.data);

	const [facebookToken] = accessTokenResponse.data;
	const { access_token: pageAccessToken } = facebookToken;

	return pageAccessToken;
};

const getPageAccessTokenExpiresAt = async (
	pageAccessToken: string,
	userAccessToken: string
) => {
	const debugTokenURL = new URL('debug_token', config.FACEBOOK_API_BASE_URL);
	const debugTokenSearchParams = new URLSearchParams();

	debugTokenSearchParams.set('input_token', pageAccessToken);
	debugTokenSearchParams.set('access_token', userAccessToken);

	debugTokenURL.search = debugTokenSearchParams.toString();

	const tokenStatus = await axios
		.get(debugTokenURL.href)
		.then((res) => res.data);

	return tokenStatus.data.expires_at;
};

const saveOrUpdatePageAccessToken = async (
	newPageAccessToken: string,
	expires_at: number
) => {
	const pageAccessToken = await Token.findOne({
		token_type: 'page_access_token',
	});
	if (pageAccessToken == null) {
		const newToken = new Token({
			access_token: newPageAccessToken,
			token_type: 'page_access_token',
			expires_in: expires_at,
		});
		await newToken.save();
		return;
	}
	pageAccessToken.access_token = newPageAccessToken;
	pageAccessToken.expires_in = expires_at;
	await pageAccessToken.save();
};

export { createPost, requestPageInformation };
