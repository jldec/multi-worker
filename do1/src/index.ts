import { DurableObject } from 'cloudflare:workers'

export interface Env {
  MY_DURABLE_OBJECT: DurableObjectNamespace<MyDurableObject>
}

export class MyDurableObject extends DurableObject {
  count: number = 0

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
  }

	async bump() {
		this.count++
		return this.count
	}

  async get() {
    return this.count
  }
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    let id: DurableObjectId = env.MY_DURABLE_OBJECT.idFromName(new URL(request.url).pathname)
    let client = env.MY_DURABLE_OBJECT.get(id)
		if (request.method === 'POST') return new Response('' + await client.bump())
    return new Response('' + await client.get())
  },
} satisfies ExportedHandler<Env>
