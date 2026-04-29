import { describe, test, expect } from "vitest"
import { createRouter } from "../src/router"
import type { HTTPMethod, Req, Route } from "../src/types"

const testReq = (url: string, method?: HTTPMethod) => {
	const req: Req = {
		path: url,
		method,
		data: null,
	}
	return req
}

describe("", () => {
	const routes: Route[] = [
		{
			path: "/",
			name: "home",
			handler: (res) => res.write("home"),
		},
		{
			path: "/articles",
			name: "articles",
			handler: (res) => res.write("articles"),
		},
		{
			path: "/articles/list",
			name: "articles-list",
			handler: (res) => res.write("articles-list"),
		},
		{
			path: "/articles/:slug",
			name: "single-article",
			handler: (res) => res.write("single-article"),
		},
		{
			path: "/delete/:id",
			name: "delete-article",
			method: "DELETE",
			handler: (res) => res.write("delete"),
		},
		{
			path: "/endpoint",
			name: "get-endpoint",
			method: "GET",
			handler: (res) => res.write("get"),
		},
		{
			path: "/endpoint",
			name: "post-endpoint",
			method: "POST",
			handler: (res) => res.write("post"),
		},
		{
			path: "not-found",
			name: "not-found",
			handler: (res) => res.write("404"),
		},
	]

	describe("resolving", () => {
		const router = createRouter({ routes })

		test("simple pages", () => {
			const url = "/articles"
			expect(router.resolve(testReq(url))).toMatchObject({
				path: url,
				name: "articles",
				params: {},
				searchParams: {},
			})
	
			const searchParams = new URLSearchParams()
			searchParams.set("step", "1")
	
			expect(router.resolve(testReq(url + "?step=1"))).toMatchObject({
				path: url + "?step=1",
				name: "articles",
				params: {},
				searchParams,
			})
		})

		test("`/articles/list` vs `/articles/:slug`", () => {
			const url = "/articles/list"
			expect(
				router.resolve(testReq(url))
			).toMatchObject({
				path: url,
				name: "articles-list",
				params: {},
				searchParams: {},
			})
		})
	
		test("params", () => {
			const url = "/articles/this-is-test"
			expect(router.resolve(testReq(url))).toMatchObject({
				path: url,
				name: "single-article",
				params: {
					slug: "this-is-test",
				},
				searchParams: {},
			})
	
			const searchParams = new URLSearchParams()
			searchParams.set("step", "1")
	
			expect(router.resolve(testReq(url + "?step=1"))).toMatchObject({
				path: url + "?step=1",
				name: "single-article",
				params: {
					slug: "this-is-test",
				},
				searchParams,
			})
		})
	
		test("404", () => {
			const url = "/my-cool-page/123?step=1"
	
			const searchParams = new URLSearchParams()
			searchParams.set("step", "1")
	
			expect(router.resolve(testReq(url))).toMatchObject({
				path: url,
				name: "not-found",
				params: {},
				searchParams,
			})
		})

		test("with method", () => {
			const url = "/delete/123"
	
			expect(router.resolve(testReq(url, "GET"))).toMatchObject({
				path: url,
				name: "not-found",
				params: {},
			})

			expect(router.resolve(testReq(url, "DELETE"))).toMatchObject({
				path: url,
				name: "delete-article",
				params: { id: "123" },
			})
		})

		test("one endpoint with two methods", () => {
			const url = "/endpoint"
	
			expect(router.resolve(testReq(url, "GET"))).toMatchObject({
				path: url,
				name: "get-endpoint",
				params: {},
			})

			expect(router.resolve(testReq(url, "POST"))).toMatchObject({
				path: url,
				name: "post-endpoint",
				params: {},
			})
		})
	})
})
