import { createRouter } from "./src/index.ts"
import type { Res, Req, ResolvedRoute } from "./src/types.ts"

type Article = {
	slug: string
	title: string
	text: string
}

const articles = new Map<string, Article>()

// Create router with routes
const router = createRouter({
	routes: [
		{
			path: "/articles/:slug",
			handler: (res) => {
				const params = res.route.params as { slug: string }
				const a = articles.get(params.slug)
				res.write({ status: 200, body: a })
			},
		},
		{
			path: "/articles/new",
			method: "POST",
			handler: (res) => {
				const data = res.req.data as Article
				articles.set(data.slug, data)
				res.write({ status: 200, text: "ok" })
			},
		},
		{
			path: "*",
			name: "not-found",
			handler: (res) => {
				res.write({ status: 404, text: "not found" })
			},
		},
	],
})

// Create request
const req: Req = {
	path: "/articles/new",
	method: "POST",
	data: {
		slug: "slug-1",
		title: "Article 1",
		text: "Lorem ipsum dolor sit amet",
	},
}

// use router to resolve route
const route = router.resolve(req)

// prepare object to pass to handler
const makeRes = (req: Req, route: ResolvedRoute) => {
	const res: Res = {
		req,
		route,
		write: (data) => {
			const { status, body, text } = data as { status: number, body?: object, text?: string }
			console.log(status, body, text)
		},
	}

	return res
}

// handle route
route.handler(makeRes(req, route))


// new request
const req2: Req = { path: "/articles/slug-1" }

const route2 = router.resolve(req2)

route2.handler(makeRes(req2, route2))


