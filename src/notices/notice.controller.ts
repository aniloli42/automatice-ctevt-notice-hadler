import { Request, Response } from 'express';
import { HTTP_RESPONSE } from '../common/constants/http.constants.js';
import logger from '../services/logger.js';
import { getNoticeById, getSavedNotices } from './notice.service.js';

export const getNotices = async (req: Request, res: Response) => {
	const { limit, offset } = req.query;

	const notices = await getSavedNotices(limit, offset);
	res.status(HTTP_RESPONSE.SUCCESS).json(notices);
};

export const getNotice = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const notice = await getNoticeById(id);

		if (!notice)
			res
				.status(HTTP_RESPONSE.NOT_FOUND)
				.json({ message: 'notice not found.' });

		res.status(HTTP_RESPONSE.SUCCESS).json(notice);
	} catch (error) {
		if (error instanceof Error) logger.error(error.message);
		res.status(HTTP_RESPONSE.SERVER_ERROR).send('Server Failed');
	}
};
