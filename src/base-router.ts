import type { HistoryItem, ResolvedRoute, Route, RouterPush, RouterPushValue } from './types'
import { PUSH_EVENT, PUSH_EXTERNAL_EVENT } from './events'
import { EventBus } from '@laranatech/event-bus'

export type BaseRouterOpts = {
	base?: string
	debug?: boolean
	routes: Route[]
	eventBus: EventBus
}
export abstract class BaseRouter {
	base: string
	debug: boolean = false
	routes: Route[] = []
	history: HistoryItem[] = []
	fullHistory: HistoryItem[] = []
	eventBus: EventBus
	currentRoute: ResolvedRoute | null = null

	constructor({
		base = 'https://larana.tech',
		debug = false,
		routes,
		eventBus,
	}: BaseRouterOpts) {
		this.base = base
		this.debug = debug
		this.routes = routes
		this.eventBus = eventBus
	}

	resolve(url: string, base?: string): ResolvedRoute {
		const route = this._resolve(new URL(url, base || this.base))
		this.currentRoute = route
		return route
	}

	_resolve(url: URL): ResolvedRoute {
		let route = this.routes.find((r) => r.path === url.pathname)

		const segments = url.pathname
			.split('/')
			.filter((item) => item)

		let params = {}
		this.routes.some((r) => {
			const hasParams = r.path.includes(':')

			if (!hasParams) {
				return false
			}

			const rSegments = r.path
				.split('/')
				.filter((item) => item)

			if (rSegments.length !== segments.length) {
				return false
			}

			const p: object = {}

			const f = rSegments.every((rs, i) => {
				if (rs === segments[i]) {
					return true
				}

				if (!rs.startsWith(':')) {
					return false
				}

				Object.assign(p, { [rs.replace(':', '')]: segments[i] })

				return true
			})

			if (f) {
				route = r
				params = { ...p }
				return true
			}
		})

		if (!route) {
			const notFoundRoute = this.routes.find((p) => p.name === 'not-found')
			return {
				url: url.pathname + url.search,
				name: 'not-found',
				page: notFoundRoute ? notFoundRoute.page : undefined,
				params,
				searchParams: url.searchParams,
			}
		}

		return {
			...route,
			url: url.pathname + url.search,
			params,
			searchParams: url.searchParams,
		}
	}

	push(value: RouterPushValue) {
		const r = this._parsePushValue(value)

		const route = this._resolve(r)
		const historyItem = { ts: Date.now(), route }

		this.history.push(historyItem)
		this.fullHistory.push(historyItem)

		if (this.debug) {
			// eslint-disable-next-line no-console
			console.log(historyItem)
		}

		this.eventBus.dispatch(PUSH_EVENT, route)
	}

	pushExternal(url: string) {
		this.eventBus.dispatch(PUSH_EXTERNAL_EVENT, url)
	}

	_parsePushValue(value: RouterPushValue): URL {
		if (typeof value === 'string') {
			return new URL(value, this.base)
		}

		return this._parsePushObject(value)
	}

	_parsePushObject(value: RouterPush) {
		if (value.name && value.url) {
			throw new Error('Cannot push using both `url` and `name` params')
		}

		if (value.url) {
			if (value.searchParams) {
				return new URL(`${value.url}?${value.searchParams.toString()}`, this.base)
			}

			if (value.params) {
				throw new Error('Cannot set `params` when pushing with `url`')
			}

			return new URL(value.url, this.base)
		}

		if (!value.name) {
			throw new Error('Invalid push — provide url or name')
		}

		return this._parsePushObjectName(value)
	}

	_parsePushObjectName(value: RouterPush) {
		const route = this.routes.find((r) => r.name === value.name)

		if (!route) {
			throw new Error(`Route not found: ${value.name}`)
		}

		if (route.path.indexOf(':') === -1) {
			if (value.params) {
				throw new Error(`Cannot set params to this route: ${route.path}`)
			}

			if (value.searchParams) {
				return new URL(`${route.path}?${value.searchParams.toString()}`, this.base)
			}

			return new URL(route.path, this.base)
		}

		if (!value.params) {
			throw new Error('Params were expected')
		}

		const url = route.path
			.split('/')
			.map((p) => {
				if (!p.startsWith(':')) {
					return p
				}
				const key = p.replace(':', '')

				// @ts-expect-error TODO: fix
				return value.params[key]
			})
			.join('/')

		return new URL(url, this.base)
	}

	goBack() {
		if (this.history.length <= 1) {
			return
		}
		this.history.pop()
		const last = this.history.pop()

		if (!last) {
			return
		}

		this.push(last?.route.url)
	}
}
