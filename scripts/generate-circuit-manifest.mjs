// Lists every track outline in public/circuits so the app can use any
// outline that exists without a hand-maintained list. Jolpica's circuitId
// (e.g. "marina_bay", "americas") is the file name, so dropping
// public/circuits/<circuitId>.svg in is all a new circuit needs.
// Runs automatically before `dev` and `build` (see package.json).
import { readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const names = readdirSync(join(root, "public", "circuits"))
  .filter((file) => file.endsWith(".svg"))
  .map((file) => file.slice(0, -4))
  .sort();

writeFileSync(
  join(root, "lib", "circuit-manifest.json"),
  JSON.stringify(names, null, 2) + "\n",
);
console.log(`circuit manifest: ${names.length} outlines`);
