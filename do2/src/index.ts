import type { MyDurableObject } from '../../do1/src'

export interface Env {
  MY_DURABLE_OBJECT: DurableObjectNamespace<MyDurableObject>
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    let id: DurableObjectId = env.MY_DURABLE_OBJECT.idFromName(new URL(request.url).pathname)
    let client = env.MY_DURABLE_OBJECT.get(id)
    if (request.method === 'POST') return new Response('' + (await client.bump()))
    return new Response('' + (await client.get()))
  },
} satisfies ExportedHandler<Env>
