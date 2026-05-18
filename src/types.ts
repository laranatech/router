export type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type Req = {
	path: string
	method?: HTTPMethod
	data?: unknown
}

export type Res<T> = {
	req: Req
	route: ResolvedRoute<T>
}

export type Handler<T> = (res: Res<T>) => T

export type Route<T> = {
	path: string
	name?: string
	method?: HTTPMethod
	handler: Handler<T>
}

export type ResolvedRoute<T> = Route<T> & {
	params: unknown
	searchParams: URLSearchParams
}
