export type Notice = {
	noticeTitle: string
	noticeLink: string
	files: File[]
	publishedBy: string
	publishedAt: string
	facebookPostId?: string
}

export type File = {
	fileName: string
	fileLink: string
}
