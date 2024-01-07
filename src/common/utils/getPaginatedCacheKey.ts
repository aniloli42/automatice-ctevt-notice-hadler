type PaginatedKeys = { page?: number; limit?: number; initialKey: string }

export const getPaginatedCacheKey = ({
	page,
	limit,
	initialKey
}: PaginatedKeys): string => {
	let cacheKey = initialKey
	if (page != undefined || limit != undefined)
		cacheKey = `${initialKey}?page=${page}&limit=${limit}`

	return cacheKey
}
