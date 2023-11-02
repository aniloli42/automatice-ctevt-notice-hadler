import { Request, Response } from 'express';
import noticeModel from '../models/notice.model.js';
import { createPost } from '../services/facebook.js';
import scrapper from '../services/scrapper.js';

export const getNotices = async (_, res: Response) => {
	const notices = await getStoredNotices();
	res.status(200).json(notices);
};

export const getNoticeById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const notice = await noticeModel.findById(id);

		if (!notice) return res.status(404).send('Notice not found');
		delete notice.facebookPostId;

		res.status(200).json(notice);
	} catch (error: unknown) {
		if (error instanceof Error) console.error(error.message);
		res.status(404).send('Invalid Notice Id');
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

		if (scrappedNotices == undefined)
			throw new Error('Unable to scrap the notices. Check the issue');

		const newNotices = await filterNewNotices(scrappedNotices);

		if (newNotices.length === 0) return console.log('No New Notices Found');

		console.log(`New Notices: ${newNotices.length}`);

		for await (const notice of newNotices) {
			const noticePostId = await postNotice(notice);
			await saveNotice(notice, noticePostId);
			console.log(`Notice Posted: ${noticePostId}`);
		}
	} catch (error) {
		console.error(error);
	}
};

const filterNewNotices = async (scrappedNotices: Notice[]) => {
	const oldNotices = await getStoredNotices();

	if (!oldNotices?.length) return scrappedNotices;

	const newNotices = scrappedNotices.filter((scrappedNotice) =>
		oldNotices.every((oldNotice) => filterNewNotice(scrappedNotice, oldNotice))
	);

	return newNotices;
};

const filterNewNotice = (newNotice: Notice, oldNotice: Notice) => {
	const isPublishedAtMatched = newNotice.publishedAt !== oldNotice.publishedAt;
	const isNoticeTitleMatched = newNotice.noticeTitle !== oldNotice.noticeTitle;
	const isNoticeLinkMatched = newNotice.noticeLink !== oldNotice.noticeLink;

	return isPublishedAtMatched && isNoticeLinkMatched && isNoticeTitleMatched;
};

const saveNotice = async (notice: Notice, noticePostId: string) => {
	const newNotice = new noticeModel({
		...notice,
		facebookPostId: noticePostId,
	});
	await newNotice.save();
};

const postNotice = async (notice: Notice): Promise<string> => {
	return await createPost({
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
	)}

		#techaboutneed #ctevtnotices #ctevt
		`,
	});
};

export const getStoredNotices = async (): Promise<Notice[] | undefined> => {
	return (await noticeModel.find().sort({ _id: -1 }).limit(10)) as Notice[];
};

export default reviewNoticeAndPost;
