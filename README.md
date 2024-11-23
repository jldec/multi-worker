# multi-worker
This repo contains 2 experiments, both using Cloudflare Workers [RPC](https://developers.cloudflare.com/workers/runtime-apis/rpc/). Hopefully the various TypeScript signatures are helpful.


# Basic worker-to-worker RPC
[worker2](worker2/src/index.ts) calls [worker1](worker1/src/index.ts) over RPC without durable objects.

### worker2
```ts
import MyWorkerWithRPC from '../../worker1/src/index'

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
```

### worker1
```ts
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
```


# Durable Object RPC
[do2](do2/src/index.ts) calls Durable Object in [do1](do1/src/index.ts) using worker-to-worker RPC.

The reason for the this experiment was to work around a [limitation](https://github.com/cloudflare/workers-sdk/issues/5918) of the current wrangler-miniflare setup, which prevents calling the durable object via RPC from a separate worker (not the durable object "host").

In this case the workaround was to use worker-to-worker RPC to forward RPC calls. The RPC method signatures in the worker require an extra parameter to resolve the durable object instance.

### do2
```ts
import type MyDOWorker from '../../do1/src/index'

interface Env {
  MY_DO_WORKER: Service<MyDOWorker>
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    let pathname = new URL(request.url).pathname
    if (request.method === 'POST')
      return new Response(
        'do2: bumped do1 worker - returned ' + (await env.MY_DO_WORKER.bump(pathname))
      )
    return new Response(
      'do2: called do1 worker - returned ' + (await env.MY_DO_WORKER.get(pathname))
    )
  }
} satisfies ExportedHandler<Env>
```

### do1
```ts
import { DurableObject } from 'cloudflare:workers'
import { WorkerEntrypoint } from 'cloudflare:workers'

interface Env {
  MY_DURABLE_OBJECT: DurableObjectNamespace<MyDurableObject>
}

export class MyDurableObject extends DurableObject<Env> {
  private count: number = 0

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

  private resolve(pathname: string) {
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
```