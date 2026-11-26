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
- An item ships only when its port passes `bun run verify` *and* typechecks
  against the pinned `@effect/ui` snapshot (`bun run check`).
