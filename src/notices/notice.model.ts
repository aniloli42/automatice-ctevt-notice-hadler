import { Schema, model } from 'mongoose'

const ctevtSchema = new Schema(
	{
		publishedAt: {
			type: String,
			required: true
		},
		noticeTitle: {
			type: String,
			required: true
		},
		noticeLink: {
			type: String,
			required: true,
			unique: true
		},
		files: {
			type: [Object],
			required: true
		},
		facebookPostId: {
			type: String
		},
		publishedBy: {
			type: String,
			required: true
		}
	},
	{ timestamps: true }
)

const notice = model('notice', ctevtSchema)

export default notice
