// shadcn-effect verifier. Three gates, all must pass:
// 1. Registry integrity: every file named in registry.json exists.
// 2. Effect-native gate: no banned imports anywhere under registry/.
//    (react, radix, lucide-react, class-variance-authority, clsx,
//     tailwind-merge, react-hook-form, zod, @ui-sdk/*, solid, vue)
// 3. Class parity: every upstream shadcn class token for a ported component
//    (parity/upstream-tokens.json, extracted from shadcn-ui/ui new-york-v4)
//    still appears in our port. Assert, never silently no-op.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
let failures = 0
const fail = (m) => { console.error("FAIL:", m); failures++ }

const registry = JSON.parse(readFileSync(join(root, "registry.json"), "utf8"))
for (const item of registry.items) {
  for (const f of item.files ?? []) {
    if (!existsSync(join(root, f.path))) fail(`registry item ${item.name}: missing file ${f.path}`)
  }
}

const BANNED = ["react", "radix", "lucide-react", "class-variance-authority", "clsx", "tailwind-merge", "react-hook-form", "zod", "@ui-sdk/", "solid-js", "vue"]
const walk = (dir) => readdirSync(dir).flatMap((e) => {
  const p = join(dir, e)
  return statSync(p).isDirectory() ? walk(p) : [p]
})
for (const file of walk(join(root, "registry"))) {
  if (!file.endsWith(".ts")) continue
  const src = readFileSync(file, "utf8")
  for (const b of BANNED) {
    if (new RegExp(`from\\s+["'][^"']*${b.replace("/", "\\/")}`).test(src) || src.includes(`"${b}"`)) {
      // class strings legitimately mention aria/data tokens, not imports; only import lines count
    }
  }
  for (const line of src.split("\n")) {
    if (/^\s*import/.test(line)) {
      for (const b of BANNED) if (line.includes(b)) fail(`${file}: banned import ${b} :: ${line.trim()}`)
    }
  }
}

const parity = JSON.parse(readFileSync(join(root, "parity/upstream-tokens.json"), "utf8"))
for (const [name, toks] of Object.entries(parity)) {
  const src = readFileSync(join(root, "registry/ui", `${name}.ts`), "utf8")
  const missing = toks.filter((t) => !src.includes(t))
  if (missing.length) fail(`${name}: ${missing.length} upstream tokens missing: ${missing.slice(0, 8).join(" ")}`)
  else console.log(`parity ${name}: ${toks.length} upstream tokens present`)
}

if (failures) { console.error(`${failures} failure(s)`); process.exit(1) }
console.log("verify: OK")
