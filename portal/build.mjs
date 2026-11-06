import { build } from "esbuild";
import { readFile } from "node:fs/promises";
const config = JSON.parse(
  await readFile(new URL("../client/config.json", import.meta.url), "utf8"),
);
const key = config.supabasePublishableKey || "";
let publicKey = key.startsWith("sb_publishable_");
if (key.split(".").length === 3) {
  try {
    publicKey =
      JSON.parse(Buffer.from(key.split(".")[1], "base64url")).role === "anon";
  } catch {
    publicKey = false;
  }
}
if (
  (config.supabaseUrl || key) &&
  (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(config.supabaseUrl) ||
    !publicKey)
)
  throw new Error(
    "client/config.json must contain only a Supabase URL and a publishable/anon key. Never use a secret or service-role key.",
  );
if (
  Object.keys(config).some(
    (k) => !["supabaseUrl", "supabasePublishableKey"].includes(k),
  )
)
  throw new Error(
    "Unexpected public configuration fields. Store server credentials in backend secrets only.",
  );
await build({
  entryPoints: [new URL("./src/app.js", import.meta.url).pathname],
  outfile: new URL("../client/portal.js", import.meta.url).pathname,
  bundle: true,
  format: "esm",
  target: ["safari16", "chrome110"],
  minify: true,
  legalComments: "eof",
});
console.log(
  "Built the public portal shell. No client records or secrets are bundled.",
);
