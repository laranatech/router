import { PUSH_EVENT, PUSH_EXTERNAL_EVENT, RELOAD_EVENT } from './events'
import { EventBus } from '@laranatech/event-bus'

export class RouterClient {
	eventBus: EventBus

	constructor(eventBus: EventBus) {
		this.eventBus = eventBus

		eventBus.subscribe(PUSH_EVENT, (_, url) => {
			if (typeof url !== 'string') {
				throw new Error(`Invalid url: ${url}`)
			}
			this.push(url)
		})

		eventBus.subscribe(PUSH_EXTERNAL_EVENT, (_, url) => {
			if (typeof url !== 'string') {
				throw new Error(`Invalid url: ${url}`)
			}
			this.pushExternal(url)
		})

		eventBus.subscribe(RELOAD_EVENT, () => {
			this.reload()
		})
	}

	push(url: string) {
		location.replace(url)
	}

	pushExternal(url: string) {
		window.open(url, '_blank')
	}

	reload() {
		location.reload()
	}
}
