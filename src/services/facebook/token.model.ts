import { Schema, model } from 'mongoose'

const tokenSchema = new Schema(
	{
		access_token: {
			type: String,
			required: true
		},
		token_type: {
			type: String,
			required: true
		},
		expires_in: {
			type: Number,
			required: true
		}
	},
	{ timestamps: true }
)

const token = model('token', tokenSchema)

export default token
