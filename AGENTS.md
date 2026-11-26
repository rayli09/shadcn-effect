# AGENTS.md — shadcn-effect

You are porting shadcn/ui components to Effect UI. Read `docs/PORTING-RULES.md`
and `docs/MAPPING.md` before touching a component.

- One component per lane/PR. Port from the upstream file in
  `shadcn-ui/ui` `apps/v4/registry/new-york-v4/ui/<name>.tsx` (style: new-york-v4).
- Extract the upstream class tokens into `parity/upstream-tokens.json` in the
  same change; `scripts/verify.mjs` must pass. Never edit parity tokens to make
  a failing port pass — fix the port.
- Check the kit part's real API in `Effect-TS/ui` `packages/ui-kit/src/<Name>.ts`
  (its doc comment carries a runnable example) before writing the wrapper.
  Never guess an `@effect/ui` API — the snapshot moves.
- Stateless → view function. Stateful → `Html.component` with Schema Model +
  UiSchema.TaggedEnum Messages. No state outside Model/Query/Provider/runtime.
- No banned imports (list in PORTING-RULES.md). No React idioms: no hooks,
  no context, no forwardRef, no Slot.
- Done = verify green + `bun run check` (tsc) green + a Story or Scene test
  for stateful components.
