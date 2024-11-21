import { WorkerEntrypoint } from "cloudflare:workers";

export default class extends WorkerEntrypoint {
  async fetch() { return new Response("Hello from worker1"); }

  add(a: number, b: number) {
		console.log("Adding", a, b);
		return a + b;
	}
}