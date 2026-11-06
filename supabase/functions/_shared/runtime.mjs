import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { repository } from "./repository.mjs";
export function runtime(env) {
  const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const auth = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const stripe = new Stripe(env.STRIPE_SECRET_KEY || "unconfigured", {
    apiVersion: "2026-10-28.endive",
    httpClient: Stripe.createFetchHttpClient(),
    maxNetworkRetries: 1,
    timeout: 20000,
  });
  return {
    env,
    db,
    auth,
    stripe,
    repo: repository(db),
    cryptoProvider: Stripe.createSubtleCryptoProvider(),
  };
}
export function environment() {
  return Deno.env.toObject();
}
