# shadcn-effect

shadcn/ui, ported 1:1 to **Effect UI** — 100% Effect-native.

Same component names, same `data-slot` / `data-variant` / `data-size` attributes,
same Tailwind class strings (machine-checked against upstream), same registry
distribution model. Different engine: no React, no Radix, no cva, no hooks,
no lucide-react, no react-hook-form, no zod.

| shadcn/ui (upstream)       | shadcn-effect                                    |
| -------------------------- | ------------------------------------------------ |
| React components           | `@effect/ui` Components + view functions         |
| Radix / Base UI primitives | `@effect/ui-kit` headless parts (41+ components) |
| cva variants               | Pure functions + string-union variant types      |
| `useState` / context       | Component Model / Message / update, Providers    |
| react-hook-form + zod      | kit `Form` / `Field` + `effect` Schema           |
| lucide-react               | Inline SVG builders (lucide path data)           |
| clsx + tailwind-merge `cn` | Dependency-free `cn` (declared divergence D-1)   |

## Install (registry, like shadcn)

This repo _is_ a shadcn registry — `registry.json` at the root, GitHub-registry mode:

```sh
pnpm dlx shadcn@latest add rayli09/shadcn-effect/button
pnpm dlx shadcn@latest add rayli09/shadcn-effect/badge
pnpm dlx shadcn@latest add rayli09/shadcn-effect/theme
```

No `components.json` registry configuration is needed — the GitHub repo is
the registry. Items depend on each other by full GitHub address
(`rayli09/shadcn-effect/utils`, …), as the shadcn GitHub-registry docs
require; a bare dependency name would resolve against the default shadcn
registry instead. Verified end-to-end with a scratch consumer project
(button + its utils dependency install as TypeScript, with `effect` and
the `@effect/ui` snapshots pulled in automatically).

Prerequisite in the consuming app: `effect` + the `@effect/ui` snapshot builds
(Effect UI is public preview, not on npm yet):

```sh
pnpm add effect \
  https://pkg.pr.new/Effect-TS/ui/@effect/ui@main \
  https://pkg.pr.new/Effect-TS/ui/@effect/ui-kit@main
```

## Toolchain

Bun only, and it needs a **canary** build (>= 1.4.6-canary): `bun lint`
exists only there. Stable bun has `bun check` and `bun fmt` but no lint.

- `bun run lint` — bun lint (config in `bunfig.toml`)
- `bun run fmt` — bun fmt (printWidth 100, config in `bunfig.toml`)
- `bun run check` — bun check (native type check)
- `bun run test` — vitest via `@effect/vitest` (the Scene/Play harness is
  vitest-bound; bun's trio doesn't cover it)
- `bun run verify` — import gate + class-parity manifest

## Status

Two component generations, one registry (137 items):

- **new-york generation** (`button`, `card`, …): all 58 portable upstream
  new-york-v4 files ported and parity-verified + the date-picker composition.
  Full utilities inline; theme via CSS variables only.
- **bases generation** (`base-button`, `base-card`, …): all 60 portable
  upstream bases/radix files ported with the `cn-*` hook class layer
  verbatim + a date-picker composition. Visual design lives in the style
  presets: 8 vendored byte-for-byte (`style-vega`, `style-nova`,
  `style-maia`, `style-lyra`, `style-mira`, `style-luma`, `style-sera`,
  `style-rhea`) plus the theme matrix — 7 base colors (the `theme` item is
  neutral; `theme-stone`, `theme-zinc`, `theme-mauve`, `theme-olive`,
  `theme-mist`, `theme-taupe` override its variables). Bases adds three
  components new-york never had: `base-code-block`, `base-questionnaire`
  (step navigation native in the Component Model), `base-trace`. The bases
  generation has no form item — `base-field` is the form surface, as
  upstream. See [docs/PRESETS.md](docs/PRESETS.md) for activation.
- Only chart, carousel, resizable remain unported in both generations —
  declared in docs/PORTING-RULES.md D-4 (they wrap React-only engines:
  Recharts, embla, react-resizable-panels).

Full upstream mapping, primitive by primitive: [docs/MAPPING.md](docs/MAPPING.md).
Porting rules and the banned-dependency list: [docs/PORTING-RULES.md](docs/PORTING-RULES.md).

```sh
bun run verify   # registry integrity + banned-import gate + class parity
```

## Why

shadcn proved the distribution model (own your components, install by registry).
Effect UI is the first frontend runtime where the components themselves can be
Schema-typed, message-driven, replayable in DevTools, and testable with
Story / Scene / Play tests — without a browser. shadcn-effect is shadcn's skin
and distribution on Effect's skeleton.
