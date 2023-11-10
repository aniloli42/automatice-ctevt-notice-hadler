import puppeteer, { Browser } from 'puppeteer';
import { config } from '../config/env.js';
import { Notice, File } from '../notices/notice.controller.js';
import logger from './logger.js';

const scrapper = async () => {
	const browser = await puppeteer.launch({
		headless: 'new',
		args: ['--incognito', '--no-sandbox'],
		defaultViewport: null,
	});

	try {
		const page = await browser.newPage();

		await page.goto(config.WEBSITE_URL, {
			waitUntil: 'networkidle2',
			timeout: 0,
		});

		const scrapedData = await page.evaluate(scrapNotices);
		await browser.close();

		return scrapedData;
	} catch (error: unknown) {
		logger.error(error);
	} finally {
		process.once('SIGTERM', async () => await closeBrowser(browser));
	}
};

async function closeBrowser(browser: Browser) {
	if (browser) await browser.close();
	process.exit();
}

function scrapNotices(): Notice[] {
	const TABLE_BODY_SELECTOR = '#table1 > tbody';
	const tBody = document.querySelector(TABLE_BODY_SELECTOR);

	const TABLE_ROW_SELECTOR = 'tr';
	const tRow = tBody?.querySelectorAll(TABLE_ROW_SELECTOR);

	if (!tRow) throw new Error('Unable to found notice elements');

	const notices = Array.from(tRow).map((notice): Notice => {
		const noticeElements = notice.children;

		const publishedAt = (noticeElements[1] as HTMLElement).innerText;
		const noticeTitle = (noticeElements[2] as HTMLElement).innerText;
		const publishedBy = (noticeElements[4] as HTMLElement).innerText;
		const noticeLink = (
			(noticeElements[2] as HTMLElement).firstElementChild as HTMLAnchorElement
		).href;

		const files = Array.from((noticeElements[3] as HTMLElement).children).map(
			(file): File => {
				const fileLink = (file as HTMLAnchorElement).href;
				const fileName =
					((file as HTMLAnchorElement).firstElementChild as HTMLElement)
						?.title ?? '';

				return {
					fileName,
					fileLink,
				};
			}
		);

		return {
			noticeTitle,
			noticeLink,
			publishedBy,
			publishedAt,
			files,
		};
	});

	return notices;
}

export default scrapper;
