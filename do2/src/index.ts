import { DurableObject } from 'cloudflare:workers'

export interface Env {
  MY_DURABLE_OBJECT: DurableObjectNamespace
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    let id: DurableObjectId = env.MY_DURABLE_OBJECT.idFromName(new URL(request.url).pathname)
    let client = env.MY_DURABLE_OBJECT.get(id)
		// @ts-ignore
    if (request.method === 'POST') return new Response('' + (await client.bump()))
    // @ts-ignore
    return new Response('' + (await client.get()))
  },
} satisfies ExportedHandler<Env>
