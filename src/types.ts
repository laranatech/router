export type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type Req = {
	path: string
	method?: HTTPMethod
	data?: unknown
}

export type Res = {
	req: Req
	route: ResolvedRoute
	write: (data: unknown) => void
}

export type Handler = (res: Res) => void

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
