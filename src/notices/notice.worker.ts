import { createPost } from '@services/facebook/facebook.js'
import logger from '@services/logger.js'
import scrapper from '@services/scrapper.js'
import { NO_OF_NOTICES } from './notice.constants.js'
import noticeModel from './notice.model.js'
import { type Notice } from './notice.type.js'
import { linkShortner } from '@services/link-shortner.js'

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

		const errorOccurred = await postNewNotices(newNotices.reverse())

		if (errorOccurred instanceof Error)
			return logger.error(errorOccurred.message)

		logger.info(`New ${newNotices.length} notices published.`)
	} catch (error) {
		logger.error(error)
	}
}

async function postNewNotices(newNotices: Notice[]) {
	for await (const notice of newNotices) {
		const noticePostId = await postNotice(notice)
		if (noticePostId instanceof Error) {
			return Error('Unable to post the notice')
		}
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

function saveNotice(notice: Notice, noticePostId: string) {
	const newNotice = new noticeModel({
		...notice,
		facebookPostId: noticePostId
	})
	return newNotice.save()
}

async function postNotice(notice: Notice) {
	const shortNoticeLink = await linkShortner(notice.noticeLink)

	let noticeFiles = ''
	for await (const file of notice.files) {
		const shortLink = await linkShortner(file.fileLink)
		noticeFiles += `
			file: ${file.fileName}
			link: ${shortLink}\n\n
			`
	}

	return createPost({
		message: `
		${notice.noticeTitle}

		Published by: ${notice.publishedBy}
		Published at: ${notice.publishedAt}
		Notice Link: ${shortNoticeLink}

		Attached Files:
		-----------------------
    ${noticeFiles}

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
