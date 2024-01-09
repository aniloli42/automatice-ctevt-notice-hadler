export const GREET = {
	greeting: 'Welcome to CTEVT Notice Automation Server',
	endpoints: {
		'Get Notices': '/v1/api/notices',
		'Get Notices with Pagination':
			'/v1/api/notices/?page={page_no}&limit={no_of_notice}',
		'Get Notice': '/v1/api/notices/{noticeId}'
	}
} as const
