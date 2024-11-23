import type MyWorkerWithRPC from '../../worker1/src/index'

interface Env {
  // https://developers.cloudflare.com/workers/runtime-apis/rpc/typescript/
  WORKER1: Service<MyWorkerWithRPC>
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const result = await env.WORKER1.add(1, 68)
    return new Response(`Die antwoord is ${result}`)
  }
} satisfies ExportedHandler<Env>
