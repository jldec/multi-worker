import { DurableObject } from 'cloudflare:workers'
import { WorkerEntrypoint } from 'cloudflare:workers'

interface Env {
	MY_DURABLE_OBJECT: DurableObjectNamespace<MyDurableObject>;
}


export class MyDurableObject extends DurableObject<Env> {
  count: number = 0

  constructor(ctx: DurableObjectState, env: Env) {
    console.log('Constructor MyDurableObject', ctx.id)
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

export default class MyDOWorker extends WorkerEntrypoint<Env> {

  constructor(ctx: ExecutionContext, env: Env) {
    super(ctx, env)
  }

  resolve(pathname: string) {
    let id: DurableObjectId = this.env.MY_DURABLE_OBJECT.idFromName(pathname)
    return this.env.MY_DURABLE_OBJECT.get(id)
  }

  async fetch(request: Request): Promise<Response> {
    const stub = this.resolve(new URL(request.url).pathname)
    if (request.method === 'POST') return new Response('' + (await stub.bump()))
    return new Response('' + (await stub.get()))
  }

  async bump(pathname: string) {
    const stub = this.resolve(pathname)
    return stub.bump()
  }

  async get(pathname: string) {
    const stub = this.resolve(pathname)
    return stub.get()
  }
}
