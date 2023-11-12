import { FIELD_TO_BE_NEGLECTED, NO_OF_NOTICES } from './notice.constants.js';
import noticeModel from './notice.model.js';

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

export const getNoticeById = async (id: unknown) => {
	return await noticeModel.findById(id).select(FIELD_TO_BE_NEGLECTED);
};
