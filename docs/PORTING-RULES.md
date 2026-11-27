# Porting Rules — what "1:1, 100% Effect-native" means here

## The 1:1 contract (per component)

1. Same file name (`button.tsx` → `registry/ui/button.ts`), same exported names
   where the name still means something (`Button`, `buttonVariants`, `Badge`, …).
2. Same rendered element, same `data-slot`, `data-variant`, `data-size` attributes.
3. Same Tailwind class strings, byte-for-byte. Extracted from upstream
   new-york-v4 into `parity/upstream-tokens.json`; `scripts/verify.mjs` asserts
   every token survives. A patch that silently drops a class is a failed port —
   asserts, never silent no-ops.
4. Same variant and size names and defaults.
5. Behavior parity comes from the `@effect/ui-kit` part, not from hand-rolled
   DOM code: keyboard, focus, ARIA, dismissal, positioning are the kit's job.

## The Effect-native contract

Banned in `registry/**` (verify.mjs enforces the import gate):

- `react`, `react-dom`, any `radix-ui` / `@radix-ui/*`, `lucide-react`
- `class-variance-authority`, `clsx`, `tailwind-merge`
- `react-hook-form`, `zod` (forms are kit Form/Field + `effect` Schema)
- `@ui-sdk/*`, `solid-js`, `vue` — other UI runtimes; this repo is Effect only

Instead:

- State → Component Model (Schema) / Message (UiSchema.TaggedEnum) / update.
- Side effects → Command; async data → Query; shared state → Provider.
- Stateless styled pieces → view functions returning element builders
  (`h.span`, kit `Button`, …), never Components for their own sake.
- Variants → string-union types + a pure `Record` lookup. No cva.
- Icons → inline SVG builders from lucide path data (ISC), in `registry/lib/icons.ts`.
- Styling → Tailwind v4 CSS-first theme (`registry/styles/theme.css`), tokens
  copied verbatim from shadcn new-york-v4 (oklch, `:root` + `.dark`).

## Declared divergences (exhaustive; anything not listed is a bug)

- **D-1 `cn`** — no tailwind-merge conflict resolution. Class strings are
  authored conflict-free and parity-checked; caller overrides use distinct
  utilities or accept CSS-order semantics.
- **D-2 `asChild` / Slot** — does not exist. Composition = pass `element` to
  stack a kit part on the same builder (the kit's own documented pattern).
- **D-3 `form`** — API differs by design (Schema + kit Form instead of RHF+zod);
  class strings, field anatomy and error presentation stay 1:1.
- **D-4 chart / carousel / resizable** — upstream wraps React-only engines
  (Recharts, embla, react-resizable-panels). Not ported until an Effect-native
  engine exists; they stay visible in MAPPING.md, never silently dropped.

## Registry rules

- `registry.json` at repo root is the source registry (GitHub-registry mode).
  Items reference source files in `registry/`; targets land in the consumer's
  `~/src/components/ui`, `~/src/lib`, `~/src/styles`.
- Every item declares its npm `dependencies` (the `@effect/ui` snapshot URLs +
  `effect` until Effect UI is on npm) and `registryDependencies` (e.g. `utils`).
- An item ships only when its port passes `bun run verify` _and_ typechecks
  against the pinned `@effect/ui` snapshot (`bun run check`).
- **D-5 `data-state` / animation attributes** — Radix/Base UI write
  `data-state="open|closed|checked|…"` and `--radix-*` / `--vaul-*` variables;
  the kit writes `data-open`/`data-closed`/`data-checked`/`data-pressed`/
  `data-starting-style`/`data-ending-style` and `--transform-origin` /
  `--anchor-width` etc. Upstream class tokens are kept verbatim for parity.
  Where a port is controlled (checkbox, switch, radio, toggle, tabs) the
  wrapper ALSO writes `data-state` from props so the upstream variants stay
  live. Accordion adds kit-attribute equivalents (`data-open:animate-…`).
  For popups/menus/dialogs the animate-in/out utilities keyed on `data-[state=…]`
  stay inert — consumers animate via the kit attributes. This is the single
  largest behavioral divergence in the registry.
- **D-6 Portal / sub-component shape** — the kit has no Portal (positioners are
  top-layer popovers) and headless parts exist only inside a Component's view
  closure, so upstream's many small exports collapse into one Component +
  styled part appliers + exported class constants. Names and data-slots are
  preserved wherever an element actually renders.
- **D-7 Controlled-only inputs** — kit `Input` requires `props.value`
  (no uncontrolled/`defaultValue` mode). Icons are file-local inline SVG
  builders until `registry/lib/icons.ts` hoists them (wave 2 cleanup).

## D-8 — Evaluation order and slot stacking (wave 3; radio half superseded in wave 5)

- **Part-state children are callbacks** — SUPERSEDED for menus (wave 5).
  The hazard was real: the kit `radioItem` part read a closure variable
  the `radioGroup` part set when called, so items built before their
  group rendered unchecked. This repo's finding was filed upstream as
  Effect-TS/ui#445 and fixed in PR #474: checked state now comes from
  the Menu `items` prop data (`checked` per item, like `disabled`), the
  parts read their own state from props, and build order no longer
  matters. The menu RadioGroup wrappers reverted to plain `children`
  arguments and lost their `{ value }` option; CheckboxItem lost its
  `checked` option. The general lesson stands for future kit parts:
  if a part reads state another part records during the same view
  evaluation, children that depend on it must be built after it runs —
  but prefer the items-data model when the kit offers one.
- **A stacked element's own `data-slot` wins.** When a port stacks onto a
  caller-supplied element (the D-2 composition), stamps chain in build
  order and the later stamp wins — so a control element's own slot (e.g.
  Input's `data-slot="input"`) overrides the slot a part stamped on the
  element it was handed (e.g. FormField's `data-slot="form-control"`).
  This is upstream's behavior, not a bug: FormControl is a Radix Slot and
  Radix `mergeProps` resolves `{ ...slotProps, ...childProps }` — child
  props win. `form-control` still lands on control elements that don't
  stamp their own slot.
