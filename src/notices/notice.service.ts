import { createPost } from '../services/facebook/facebook.js';
import logger from '../services/logger.js';
import scrapper from '../services/scrapper.js';
import { FIELD_TO_BE_NEGLECTED, NO_OF_NOTICES } from './notice.constants.js';
import noticeModel from './notice.model.js';
import { Notice } from './notice.type.js';

export const getSavedNotices = (limit: unknown, offset: unknown) => {
	let limitNotice = NO_OF_NOTICES;
	let offsetNotice = 0;

	if (limit != undefined && typeof +limit === 'number') limitNotice = +limit;
	if (offset != undefined && typeof +offset === 'number')
		offsetNotice = +offset;

	return noticeModel
		.find()
		.sort({ _id: -1 })
		.limit(limitNotice)
		.skip(offsetNotice)
		.select(FIELD_TO_BE_NEGLECTED);
};

export const getNoticeById = (id: unknown) => {
	if (!id) throw new Error('Id is not defined');

	return noticeModel.findById(id).select(FIELD_TO_BE_NEGLECTED);
};

const reviewNoticeAndPost = async () => {
	try {
		const scrappedNotices = await scrapper();
		if (!scrappedNotices?.length)
			throw new Error('Unable to scrap the notices. Check the issue');

		const newNotices = await filterNewNotices(scrappedNotices);
		if (!newNotices?.length) return logger.info('No New Notices Found');

		logger.info(`New Notices: ${newNotices.length}`);

		await postNewNotices(newNotices.reverse());
		logger.info(`New ${newNotices.length} notices published.`);
	} catch (error) {
		logger.error(error);
	}
};

const postNewNotices = async (newNotices: Notice[]) => {
	for await (const notice of newNotices) {
		const noticePostId = await postNotice(notice);
		logger.info(`Notice Posted: ${notice.noticeTitle}`);

		await saveNotice(notice, noticePostId);
		logger.info(`Notice Saved: ${notice.noticeTitle}`);
	}
};

const filterNewNotices = async (scrappedNotices: Notice[]) => {
	const noOfNotices = 20;
	const oldNotices = await getStoredNotices(noOfNotices);
	if (!oldNotices?.length) return scrappedNotices;

	const newNotices: Notice[] = [];

	for (const notice of scrappedNotices) {
		const isNewNotice = filterNewNotice(notice, oldNotices);
		if (isNewNotice) newNotices.push(notice);
	}

	return newNotices;
};

const filterNewNotice = (newNotice: Notice, oldNotices: Notice[]) => {
	return !oldNotices.some(
		(notice) =>
			notice.noticeTitle === newNotice.noticeTitle &&
			notice.publishedBy === newNotice.publishedBy &&
			notice.publishedAt === newNotice.publishedAt
	);
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

export const getStoredNotices = async (
	noOfNotices: number = NO_OF_NOTICES
): Promise<Notice[] | undefined> => {
	return (await noticeModel
		.find()
		.sort({ _id: -1 })
		.limit(noOfNotices)) as Notice[];
};

export default reviewNoticeAndPost;
