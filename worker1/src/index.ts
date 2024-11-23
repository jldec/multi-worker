import { WorkerEntrypoint } from "cloudflare:workers";

interface Env {
}

export default class MyWorkerWithRPC extends WorkerEntrypoint<Env> {
  async fetch() { return new Response("Hello from worker1"); }

  add(a: number, b: number) {
		console.log("Adding", a, b);
		return a + b;
	}
}