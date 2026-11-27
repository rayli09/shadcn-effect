// shadcn-effect verifier. Three gates, all must pass:
// 1. Registry integrity: every file named in registry.json exists.
// 2. Effect-native gate: no banned imports anywhere under registry/.
//    (react, radix, lucide-react, class-variance-authority, clsx,
//     tailwind-merge, react-hook-form, zod, @ui-sdk/*, solid, vue)
// 3. Class parity: every upstream shadcn class token for a ported component
//    (parity/upstream-tokens.json, extracted from shadcn-ui/ui new-york-v4)
//    still appears in our port. Assert, never silently no-op.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failures = 0;
const fail = (m) => {
  console.error("FAIL:", m);
  failures++;
};

const registry = JSON.parse(readFileSync(join(root, "registry.json"), "utf8"));
for (const item of registry.items) {
  for (const f of item.files ?? []) {
    if (!existsSync(join(root, f.path))) fail(`registry item ${item.name}: missing file ${f.path}`);
  }
}

// Banned packages, matched on the import specifier's package boundary —
// a substring match would false-positive on "effect/reactivity" (contains "react").
const isBanned = (spec) =>
  spec === "react" ||
  spec.startsWith("react/") ||
  spec === "react-dom" ||
  spec.startsWith("react-dom/") ||
  spec.includes("radix") ||
  spec === "lucide-react" ||
  spec === "class-variance-authority" ||
  spec === "clsx" ||
  spec === "tailwind-merge" ||
  spec === "react-hook-form" ||
  spec === "zod" ||
  spec.startsWith("zod/") ||
  spec.startsWith("@ui-sdk/") ||
  spec === "solid-js" ||
  spec.startsWith("solid-js/") ||
  spec === "vue" ||
  spec.startsWith("vue/");
const walk = (dir) =>
  readdirSync(dir).flatMap((e) => {
    const p = join(dir, e);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
for (const file of walk(join(root, "registry"))) {
  if (!file.endsWith(".ts")) continue;
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(/^\s*import[^"']*["']([^"']+)["']/gm)) {
    if (isBanned(m[1])) fail(`${file}: banned import ${m[1]}`);
  }
}

const parity = JSON.parse(readFileSync(join(root, "parity/upstream-tokens.json"), "utf8"));
for (const [name, toks] of Object.entries(parity)) {
  const src = readFileSync(join(root, "registry/ui", `${name}.ts`), "utf8");
  const missing = toks.filter((t) => !src.includes(t));
  if (missing.length)
    fail(`${name}: ${missing.length} upstream tokens missing: ${missing.slice(0, 8).join(" ")}`);
  else console.log(`parity ${name}: ${toks.length} upstream tokens present`);
}

// Bases generation (wave 6): same gate against bases/radix tokens, applied
// to every base-* item registered in registry.json. Token entries without a
// registered item yet are pending ports, counted but not failures.
const registered = new Set(registry.items.map((i) => i.name));
const basesParity = JSON.parse(readFileSync(join(root, "parity/bases-tokens.json"), "utf8"));
let basesPending = 0;
for (const [name, toks] of Object.entries(basesParity)) {
  if (!registered.has(`base-${name}`)) {
    basesPending++;
    continue;
  }
  const file = join(root, "registry/bases/ui", `${name}.ts`);
  if (!existsSync(file)) {
    fail(`base-${name}: registered but port missing`);
    continue;
  }
  const src = readFileSync(file, "utf8");
  const missing = toks.filter((t) => !src.includes(t));
  if (missing.length)
    fail(`base-${name}: ${missing.length} upstream tokens missing: ${missing.slice(0, 8).join(" ")}`);
  else console.log(`parity base-${name}: ${toks.length} upstream tokens present`);
}
if (basesPending) console.log(`bases: ${basesPending} ports pending (no registry item yet)`);

// Gate 4: lib dependency declarations. A file importing @/lib/<x> only
// installs correctly if its registry item declares the lib item as a
// registryDependency (the CLI rewrites the alias but does not discover
// undeclared deps). Caught the hard way: 19 items used @/lib/icons
// without declaring it, so consumers got unresolvable imports.
for (const item of registry.items) {
  const deps = new Set(item.registryDependencies ?? []);
  for (const f of item.files ?? []) {
    if (!f.path.endsWith(".ts")) continue;
    const src = readFileSync(join(root, f.path), "utf8");
    for (const m of src.matchAll(/@\/lib\/([a-z-]+)/g)) {
      if (!deps.has(`rayli09/shadcn-effect/${m[1]}`))
        fail(`${item.name}: imports @/lib/${m[1]} but does not declare rayli09/shadcn-effect/${m[1]}`);
    }
  }
}

if (failures) {
  console.error(`${failures} failure(s)`);
  process.exit(1);
}
console.log("verify: OK");
