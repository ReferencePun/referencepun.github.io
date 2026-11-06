import { runtime, environment } from "../_shared/runtime.mjs";
import { createAPI } from "../_shared/api.mjs";
Deno.serve(createAPI(runtime(environment())));
