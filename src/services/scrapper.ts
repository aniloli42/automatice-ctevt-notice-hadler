import puppeteer, { Browser } from 'puppeteer';
import { config } from '../common/config/env.js';
import { Notice, File } from '../notices/notice.type.js';
import logger from './logger.js';

const scrapper = async () => {
	const browser: Browser = await puppeteer.launch({
		headless: 'new',
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			// `--proxy-server=${config.PROXY_URL}`,
		],
		defaultViewport: null,
	});
	try {
		process.once('SIGTERM', async () => await closeBrowser(browser));

		const page = await browser.newPage();
		page.setGeolocation({
			latitude: 28.3949,
			longitude: 84.124,
			accuracy: 100,
		});
		await page.goto(config.WEBSITE_URL, {
			waitUntil: 'networkidle2',
			timeout: 0,
		});

		const scrapedData = await page.evaluate(scrapNotices);

		return scrapedData;
	} catch (error: unknown) {
		logger.error(error);
	} finally {
		await browser.close();
	}
};

async function closeBrowser(browser: Browser) {
	if (browser) await browser.close();
	process.exit(1);
}

function scrapNotices(): Notice[] {
	const TABLE_BODY_SELECTOR = '#table1 > tbody';
	const noticeTableBody = document.querySelector(TABLE_BODY_SELECTOR);

	const TABLE_ROW_SELECTOR = 'tr';
	const noticeTableRow = noticeTableBody?.querySelectorAll(TABLE_ROW_SELECTOR);

	if (!noticeTableRow) throw new Error('Unable to found notice elements');

	const notices = Array.from(noticeTableRow).map((notice): Notice => {
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
