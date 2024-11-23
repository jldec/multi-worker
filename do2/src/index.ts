import type MyDOWorker from '../../do1/src/index'

interface Env {
	MY_DO_WORKER: Service<MyDOWorker>;
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    let pathname = new URL(request.url).pathname
    if (request.method === 'POST') return new Response('do2: bumped do1 worker - returned ' + (await env.MY_DO_WORKER.bump(pathname)))
    return new Response('do2: called do1 worker - returned ' + (await env.MY_DO_WORKER.get(pathname)))
  },
} satisfies ExportedHandler<Env>
