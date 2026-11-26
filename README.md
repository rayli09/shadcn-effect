# shadcn-effect

shadcn/ui, ported 1:1 to **Effect UI** — 100% Effect-native.

Same component names, same `data-slot` / `data-variant` / `data-size` attributes,
same Tailwind class strings (machine-checked against upstream), same registry
distribution model. Different engine: no React, no Radix, no cva, no hooks,
no lucide-react, no react-hook-form, no zod.

| shadcn/ui (upstream) | shadcn-effect |
|---|---|
| React components | `@effect/ui` Components + view functions |
| Radix / Base UI primitives | `@effect/ui-kit` headless parts (41+ components) |
| cva variants | Pure functions + string-union variant types |
| `useState` / context | Component Model / Message / update, Providers |
| react-hook-form + zod | kit `Form` / `Field` + `effect` Schema |
| lucide-react | Inline SVG builders (lucide path data) |
| clsx + tailwind-merge `cn` | Dependency-free `cn` (declared divergence D-1) |

## Install (registry, like shadcn)

This repo *is* a shadcn registry — `registry.json` at the root, GitHub-registry mode:

```sh
# once the GitHub repo is public:
pnpm dlx shadcn@latest add rayli09/shadcn-effect/button
pnpm dlx shadcn@latest add rayli09/shadcn-effect/badge
pnpm dlx shadcn@latest add rayli09/shadcn-effect/theme
```

Or via namespace, in your `components.json`:

```json
{ "registries": { "@shadcn-effect": "https://raw.githubusercontent.com/rayli09/shadcn-effect/main/public/r/{name}.json" } }
```

```sh
pnpm dlx shadcn@latest add @shadcn-effect/button
```

Prerequisite in the consuming app: `effect` + the `@effect/ui` snapshot builds
(Effect UI is public preview, not on npm yet):

```sh
pnpm add effect \
  https://pkg.pr.new/Effect-TS/ui/@effect/ui@main \
  https://pkg.pr.new/Effect-TS/ui/@effect/ui-kit@main
```

## Status

Wave 1 ported and parity-verified: **35 components** (button, badge, separator, accordion, alert, alert-dialog, aspect-ratio, avatar, button-group, checkbox, collapsible, combobox, command, context-menu, dialog, drawer, dropdown-menu, hover-card, input, kbd, label, menubar, native-select, popover, radio-group, select, sheet, skeleton, spinner, switch, tabs, textarea, toggle, toggle-group, tooltip) + theme + utils. Wave 2 in progress.
Full 61-file upstream mapping, primitive by primitive: [docs/MAPPING.md](docs/MAPPING.md).
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
