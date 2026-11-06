import { runtime, environment } from "../_shared/runtime.mjs";
import { createWebhook } from "../_shared/webhooks.mjs";
Deno.serve(createWebhook(runtime(environment())));
