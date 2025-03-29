import { describe, test, expect, vi } from 'vitest'
import { DefaultRouter } from '../src/default-router'
import { Route } from '../src/types'
import { EventBus } from '@laranatech/event-bus'
import { PUSH_EVENT } from '../src/events'

describe('', () => {
	const routes: Route[] = [
		{
			path: '/',
			name: 'home',
			page: 0,
		},
		{
			path: '/articles',
			name: 'articles',
			page: 1,
		},
		{
			path: '/articles/:slug',
			name: 'single-article',
			page: 2,
		},
		{
			path: 'not-found',
			name: 'not-found',
			page: 404,
		},
	]

	describe('resolving', () => {
		const eventBus = new EventBus()
		const router = new DefaultRouter({ routes, eventBus })

		test('simple pages', () => {
			const url = '/articles'
			expect(router.resolve(url)).toMatchObject({
				url,
				name: 'articles',
				params: {},
				searchParams: {},
			})
	
			const searchParams = new URLSearchParams()
			searchParams.set('step', '1')
	
			expect(router.resolve(url + '?step=1')).toMatchObject({
				url: url + '?step=1',
				name: 'articles',
				params: {},
				searchParams,
			})
		})
	
		test('params', () => {
			const url = '/articles/this-is-test'
			expect(router.resolve(url)).toMatchObject({
				url,
				name: 'single-article',
				params: {
					slug: 'this-is-test',
				},
				searchParams: {},
			})
	
			const searchParams = new URLSearchParams()
			searchParams.set('step', '1')
	
			expect(router.resolve(url + '?step=1')).toMatchObject({
				url: url + '?step=1',
				name: 'single-article',
				params: {
					slug: 'this-is-test',
				},
				searchParams,
			})
		})
	
		test('404', () => {
			const url = '/my-cool-page/123?step=1'
	
			const searchParams = new URLSearchParams()
			searchParams.set('step', '1')
	
			expect(router.resolve(url)).toMatchObject({
				url,
				name: 'not-found',
				params: {},
				searchParams,
			})
		})
	})

	describe('pushing', () => {
		describe('parsePushValue', () => {
			const base = 'https://larana.tech'
			const router = new DefaultRouter({ routes, eventBus: new EventBus(), base })

			describe('object', () => {
				test('url', () => {
					expect(
						router._parsePushValue({ url: '/abc'}).toString()
					).toBe(`${base}/abc`)
				})

				test('url with searchParams', () => {
					expect(
						router._parsePushValue({ url: '/abc', searchParams: new URLSearchParams([['a', 'b']]) }).toString()
					).toBe(`${base}/abc?a=b`)
				})

				test('url with params throws', () => {
					expect(() => router._parsePushValue({ url: '/abc', params: { name: '123' } })).toThrow()
				})

				test('name', () => {
					expect(
						router._parsePushValue({ name: 'not-found' }).toString()
					).toBe(`${base}/not-found`)
				})

				test('name with searchParams', () => {
					expect(
						router._parsePushValue({ name: 'articles', searchParams: new URLSearchParams([['a', 'b']]) }).toString()
					).toBe(`${base}/articles?a=b`)
				})

				test('name not found throws', () => {
					expect(() => router._parsePushValue({ name: 'no-name' })).toThrow()
				})

				test('name with url throws', () => {
					expect(() => router._parsePushValue({ name: 'no-name', url: '/no-name' })).toThrow()
				})

				test('name with params', () => {
					expect(
						router._parsePushValue({ name: 'single-article', params: { slug: '123' } }).toString()
					).toBe(`${base}/articles/123`)
				})

				test('name with missing params throws', () => {
					expect(
						() => router._parsePushValue({ name: 'single-article' })
					).toThrow()
				})
			})
		})

		test('by obj', () => {
			const spy = vi.fn((_event: string, _value: unknown) => {})

			const eventBus = new EventBus()
			eventBus.subscribe(PUSH_EVENT, (event, params) => {
				spy(event, params)
			})

			const router = new DefaultRouter({ routes, eventBus })

			router.push({ url: '/articles', searchParams: new URLSearchParams([['a', 'b']]) })

			expect(spy).toHaveBeenCalledWith(PUSH_EVENT, {
				url: '/articles?a=b',
				path: '/articles',
				searchParams: new URLSearchParams([['a', 'b']]),
				params: {},
				page: 1,
				name: 'articles',
			})
		})

		test('by url', () => {
			const spy = vi.fn((_event: string, _value: unknown) => {})

			const eventBus = new EventBus()
			eventBus.subscribe(PUSH_EVENT, (event, params) => {
				spy(event, params)
			})

			const router = new DefaultRouter({ routes, eventBus })

			const url = '/articles'

			const route = router._resolve(new URL(url, 'https://larana.tech'))

			router.push(url)

			expect(spy).toHaveBeenCalledWith(PUSH_EVENT, route)
		})
	})
})
