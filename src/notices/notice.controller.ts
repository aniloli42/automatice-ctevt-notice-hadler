import { Request, Response } from 'express';
import noticeModel from './notice.model.js';
import { createPost } from '../services/facebook/facebook.js';
import scrapper from '../services/scrapper.js';
import logger from '../services/logger.js';
import { HTTP_RESPONSE } from '../common/constants/http.constants.js';

export const getNotices = async (_, res: Response) => {
	const notices = await getStoredNotices();
	res.status(HTTP_RESPONSE.SUCCESS).json(notices);
};

export const getNoticeById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const notice = await noticeModel.findById(id);

		if (!notice)
			return res.status(HTTP_RESPONSE.NOT_FOUND).send('Notice not found');
		delete notice.facebookPostId;

		res.status(HTTP_RESPONSE.SUCCESS).json(notice);
	} catch (error: unknown) {
		if (error instanceof Error) logger.error(error.message);
		res.status(HTTP_RESPONSE.SERVER_ERROR).send('Invalid Notice Id');
	}
};

export type Notice = {
	noticeTitle: string;
	noticeLink: string;
	files: File[];
	publishedBy: string;
	publishedAt: string;
	facebookPostId?: string;
};

export type File = {
	fileName: string;
	fileLink: string;
};

const reviewNoticeAndPost = async () => {
	try {
		const scrappedNotices = await scrapper();

		if (!scrappedNotices?.length)
			throw new Error('Unable to scrap the notices. Check the issue');

		const newNotices = await filterNewNotices(scrappedNotices);

		if (!newNotices?.length) return logger.info('No New Notices Found');

		logger.info(`New Notices: ${newNotices.length}`);

		for await (const notice of newNotices) {
			const noticePostId = await postNotice(notice);
			logger.info(`Notice Posted: ${notice.noticeTitle}`);

			await saveNotice(notice, noticePostId);
			logger.info(`Notice Saved: ${notice.noticeTitle}`);
		}
	} catch (error) {
		logger.error(error);
	}
};

const filterNewNotices = async (scrappedNotices: Notice[]) => {
	const oldNotices = await getStoredNotices();

	if (!oldNotices?.length) return scrappedNotices;

	const newNotices: Notice[] = [];

	for await (const notice of scrappedNotices) {
		const isNewNotice = await filterNewNotice(notice);

		if (isNewNotice) newNotices.push(notice);
	}

	return newNotices;
};

const filterNewNotice = async ({
	noticeLink,
	noticeTitle,
	publishedAt,
}: Notice) => {
	const findOldNotice = await noticeModel.findOne({
		publishedAt,
		noticeTitle,
		noticeLink,
	});

	if (!findOldNotice) return true;
	return false;
};

const saveNotice = async (notice: Notice, noticePostId: string) => {
	const newNotice = new noticeModel({
		...notice,
		facebookPostId: noticePostId,
	});
	await newNotice.save();
};

const postNotice = (notice: Notice) => {
	return createPost({
		message: `
		New Notice: ${notice.noticeTitle}

		Published by: ${notice.publishedBy}
		Published at: ${notice.publishedAt}

		Check out the details of this notice: ${notice.noticeLink}

		Attached File:
		-----------------------
	${notice.files.reduce((acc, file) => {
		acc += `
			File Name: ${file.fileName}
			File Link: ${file.fileLink}
			
			---------------------
			`;

		return acc;
	}, '')}

		#techaboutneed #ctevtnotices #ctevt
		`,
	});
};

const NO_OF_NOTICES = 10;

export const getStoredNotices = async (): Promise<Notice[] | undefined> => {
	return (await noticeModel
		.find()
		.sort({ _id: -1 })
		.limit(NO_OF_NOTICES)) as Notice[];
};

export default reviewNoticeAndPost;
