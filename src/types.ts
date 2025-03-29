export type Route = {
	name: string
	path: string
	page: unknown
}

export type ResolvedRoute = {
	url: string
	name: string
	page: unknown
	params: unknown
	searchParams: URLSearchParams
}

export type HistoryItem = {
	ts: number
	route: ResolvedRoute
}

export type RouterPush = {
	url?: string
	name?: string
	params?: unknown
	searchParams?: URLSearchParams
}

export type RouterPushValue = string | RouterPush
