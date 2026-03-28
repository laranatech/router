import type {
	HTTPMethod,
	Handler,
	Req,
	ResolvedRoute,
	Route,
} from "./types"

export type Router = {
	routes: Route[]
	resolve: (req: Req) => ResolvedRoute | null
}

export type RouterOpts = {
	base?: string
	routes: Route[]
}

const noopHandler: Handler = (_req: Req) => {
	// eslint-disable-next-line
	console.error("handler not implemented")
}

const _resolve = (routes: Route[], path: string, method?: HTTPMethod) => {
	const url = new URL(path, "https://localhost")
	let route = routes.find((r) => {
		if (method !== undefined && method !== r.method) {
			return false
		}
		return r.path === url.pathname
	})

	const segments = url.pathname
		.split("/")
		.filter((item) => item)

	let params = {}
	routes.some((r) => {
		if (r.method !== method) {
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

	if (!route) {
		const notFoundRoute = routes.find((p) => p.name === "not-found")
		const res: ResolvedRoute = {
			path: url.pathname + url.search,
			name: "not-found",
			handler: notFoundRoute ? notFoundRoute.handler : noopHandler,
			params,
			searchParams: url.searchParams,
		}

		return res
	}

	const res: ResolvedRoute = {
		...route,
		path: url.pathname + url.search,
		params,
		searchParams: url.searchParams,
	}

	return res
}

export const createRouter = ({ routes }: RouterOpts) => {
	const resolve = (req: Req) => {
		return _resolve(routes, req.path, req.method)
	}

	const router: Router = {
		routes,
		resolve,
	}

	return router
}

