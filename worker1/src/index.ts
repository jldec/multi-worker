import { WorkerEntrypoint } from 'cloudflare:workers'

interface Env {
  SOME_ENV_VAR: string
}

export default class MyWorkerWithRPC extends WorkerEntrypoint<Env> {
  // fetch metchod is different from fetch handler non-RPC workers
  // https://developers.cloudflare.com/workers/runtime-apis/rpc/reserved-methods/#fetch
  async fetch() {
    return new Response('Hello from worker1')
  }

  // constructor is optional - just used for logging in this case
  constructor(ctx: ExecutionContext, env: Env) {
    console.log(`${env.SOME_ENV_VAR} constructor`)
    super(ctx, env)
  }

  add(a: number, b: number) {
    console.log(`${this.env.SOME_ENV_VAR} add`, a, b)
    return a + b
  }
}
