import { createPost } from '@services/facebook/facebook.js'
import logger from '@services/logger.js'
import scrapper from '@services/scrapper.js'
import { NO_OF_NOTICES } from './notice.constants.js'
import noticeModel from './notice.model.js'
import { type Notice } from './notice.type.js'

export async function checkNewNoticesAndPost() {
	try {
		logger.info('Checking for new notices')
		const scrappedNotices = await scrapper()
		if (scrappedNotices == undefined || scrappedNotices?.length === 0)
			throw new Error('Unable to scrap the notices. Check the issue')

		const newNotices = await filterNewNotices(scrappedNotices)
		if (newNotices?.length === 0) {
			logger.info('No New Notices Found')
			return
		}

		logger.info(`New Notices: ${newNotices.length}`)

		await postNewNotices(newNotices.reverse())
		logger.info(`New ${newNotices.length} notices published.`)
	} catch (error) {
		logger.error(error)
	}
}

const postNewNotices = async (newNotices: Notice[]) => {
	for await (const notice of newNotices) {
		const noticePostId = await postNotice(notice)
		logger.info(`Notice Posted: ${notice.noticeTitle}`)

		await saveNotice(notice, noticePostId)
		logger.info(`Notice Saved: ${notice.noticeTitle}`)
	}
}

async function filterNewNotices(scrappedNotices: Notice[]) {
	const noOfNotices = 20
	const oldNotices = await getStoredNotices(noOfNotices)
	if (oldNotices == undefined || oldNotices?.length === 0)
		return scrappedNotices

	const newNotices: Notice[] = []

	for (const notice of scrappedNotices) {
		const isNewNotice = filterNewNotice(notice, oldNotices)
		if (isNewNotice) newNotices.push(notice)
	}

	return newNotices
}

function filterNewNotice(newNotice: Notice, oldNotices: Notice[]) {
	return !oldNotices.some(
		(notice) =>
			notice.noticeTitle === newNotice.noticeTitle &&
			notice.publishedBy === newNotice.publishedBy &&
			notice.publishedAt === newNotice.publishedAt
	)
}

async function saveNotice(notice: Notice, noticePostId: string) {
	const newNotice = new noticeModel({
		...notice,
		facebookPostId: noticePostId
	})
	await newNotice.save()
}

function postNotice(notice: Notice) {
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
			`

		return acc
	}, '')}

		#techaboutneed #ctevtnotices #ctevt
		`
	})
}

export async function getStoredNotices(
	noOfNotices: number = NO_OF_NOTICES
): Promise<Notice[] | undefined> {
	return (await noticeModel
		.find()
		.sort({ _id: -1 })
		.limit(noOfNotices)) as Notice[]
}
