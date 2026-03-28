export type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type Req = {
	path: string
	method?: HTTPMethod
	data?: unknown
	write: (result: unknown) => void
}

export type Handler = (req: Req) => void

export type Route = {
	path: string
	name?: string
	method?: HTTPMethod
	handler: Handler
}

export type ResolvedRoute = Route & {
	params: unknown
	searchParams: URLSearchParams
}
