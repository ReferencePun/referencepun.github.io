import { runtime, environment } from "../_shared/runtime.mjs";
import { createJobs } from "../_shared/jobs.mjs";
Deno.serve(createJobs(runtime(environment())));
