import type {
	HTTPMethod,
	Handler,
	Req,
	ResolvedRoute,
	Route,
} from "./types"

export type Router<T> = {
	routes: Route<T>[]
	resolve: (req: Req) => ResolvedRoute<T>
}

export type RouterOpts<T> = {
	base?: string
	routes: Route<T>[]
}

const _resolve = <T>(routes: Route<T>[], path: string, method?: HTTPMethod) => {
	const url = new URL(path, "https://localhost")
	const m = method ?? "GET"
	let route = routes.find((r) => {
		const rm = r.method ?? "GET"
		if (rm !== m) {
			return false
		}
		return r.path === url.pathname
	})

	if (route !== undefined && route !== null) {
		const res: ResolvedRoute<T> = {
			...route,
			path: url.pathname + url.search,
			params: {},
			searchParams: url.searchParams,
		}
		return res
	}

	const segments = url.pathname
		.split("/")
		.filter((item) => item)

	let params = {}
	routes.some((r) => {
		const rm = r.method ?? "GET"
		if (rm !== m) {
			return false
		}
		const hasParams = r.path.includes(":")

		if (!hasParams) {
			return false
		}

		const rSegments = r.path
			.split("/")
			.filter((item) => item)

		if (rSegments.length !== segments.length) {
			return false
		}

		const p: object = {}

		const f = rSegments.every((rs, i) => {
			if (rs === segments[i]) {
				return true
			}

			if (!rs.startsWith(":")) {
				return false
			}

			Object.assign(p, { [rs.replace(":", "")]: segments[i] })

			return true
		})

		if (f) {
			route = r
			params = { ...p }
			return true
		}
	})

	const noopHandler: Handler<T> = (_res) => {
		// eslint-disable-next-line
		console.error("handler not implemented")
		return null as T
	}

	if (route === undefined || route === null) {
		const notFoundRoute = routes.find((p) => p.name === "not-found")
		const res: ResolvedRoute<T> = {
			path: url.pathname + url.search,
			name: "not-found",
			handler: notFoundRoute ? notFoundRoute.handler : noopHandler,
			params,
			searchParams: url.searchParams,
		}

		return res
	}

	const res: ResolvedRoute<T> = {
		...(route as Route<T>),
		path: url.pathname + url.search,
		params,
		searchParams: url.searchParams,
	}

	return res
}

export const createRouter = <T>({ routes }: RouterOpts<T>) => {
	const resolve = (req: Req) => {
		return _resolve(routes, req.path, req.method)
	}

	const router: Router<T> = {
		routes,
		resolve,
	}

	return router
}

