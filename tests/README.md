# Testing the ports — the Scene pattern

Every stateful port gets a test in this directory, modeled on
`checkbox.test.ts` and `switch.test.ts`. Read those two first; this page is
the recipe and the hard-won rules behind them.

## Run

```sh
bun x vitest run                          # or: bun run test
./node_modules/.bin/tsc -p tsconfig.tests.json   # tests typecheck
```

`vitest.config.ts` includes `tests/**/*.test.ts` and loads
`vitest.setup.ts`, which registers `@effect/vitest`'s equality testers
(the upstream Effect-TS/ui setup, in miniature). Tests use `it.effect`
from `@effect/vitest` — it provides the `Scope` that `Scene.make` /
`Play.make` need.

## The consumer recipe

Our ports are **view functions** wrapping kit headless components — they
own no state. So a test never tests the port alone; it defines the
smallest **consumer Component** that owns the state, exactly as an app
would:

```ts
const TermsMessage = UiSchema.TaggedEnum({
  ToggledTerms: { checked: Schema.Boolean },
});

const TermsForm = Html.component({
  name: "TermsForm",
  props: Schema.Struct({ disabled: Schema.optional(Schema.Boolean) }),
  model: Schema.Struct({ terms: Schema.Boolean }),
  message: TermsMessage,
}).make({
  init: () => ({ terms: false }),
  update: {
    ToggledTerms: ($, { checked }) => $.evolve({ terms: checked }),
  },
  view: (h, model) =>
    Checkbox(h, {
      props: { checked: model.terms, disabled: h.props.disabled, name: "terms" },
      onToggle: ({ checked }) => TermsMessage.ToggledTerms({ checked }),
    }),
});
```

Four parts, every time:

1. **Message** — a `UiSchema.TaggedEnum` with one variant per port
   callback (`onToggle`, `onPick`, `onEmit` mappings, …), carrying the
   payload the callback receives.
2. **Model** — a `Schema.Struct` holding the controlled value(s) the port
   reads (`checked`, `open`, `value`, …).
3. **update** — the object form, one handler per Message variant, applying
   the payload to the Model (`$.evolve`).
4. **view** — draws the port with `props` read from the Model and the
   callback mapped to the Message. Variant knobs a test needs (disabled,
   size, orientation) come in as consumer **props**, read via `h.props`,
   so one consumer serves every test case via `Scene.make(C, { …props })`.

## Driving the Scene

```ts
const scene = yield * Scene.make(TermsForm, {});
scene.get(root).attrs; // raw attribute record
scene.expect(root).toHaveAttribute("data-state", "checked");
scene.fire(root, "click"); // when the handler is the consumer's own layer
scene.childEmit(KitCheckbox, { _tag: "Toggled", checked: true });
```

- **Locators**: prefer `Locator.attr("data-slot", "<name>")` — every port
  stamps upstream's `data-slot` on each part, so locators survive class
  changes and match exactly one part. `Locator.attr("role", …)`,
  `Locator.tag(…)`, `Locator.text(…)` and `HtmlLocator` (from
  `@effect/ui/html/testing`) cover the rest.
- **Assertions**: `scene.get(loc).attrs` for exact attribute records
  (flags the kit writes are present with `""`, absent otherwise —
  `assert.isUndefined(attrs?.["data-unchecked"])` proves a flag is gone),
  and `scene.expect(loc).toHaveAttribute / toHaveText / toExist /
toHaveCount` for locator-level checks with better failure messages.
- **Class parity in tests**: `cn()` with no extra class returns the
  port's class constant verbatim, so assert
  `attrs.class === CHECKBOX_CLASS` (strictEqual), not a substring.
- **The acknowledgement rule**: an interaction whose handler produced no
  message must be followed by `.expectIgnored()`, or `Scene.make`'s end
  check fails the test. Interactions that produce a message need nothing.

## The rules that bite (learned from checkbox + switch)

1. **A Scene never runs a child's update.** If the only handler for an
   event lives in a kit headless child's parts (Checkbox, Accordion,
   Dialog, Select, the menus, …), `scene.fire(...)` is _refused_:
   `Scene.fire: only /TermsForm/Checkbox[] handles "click" … use
givenChild for its Model, or a Play.` The Scene idiom is
   **`scene.childEmit(KitComponent, event)`**: stand in for what the child
   emits; the consumer's `onEmit` mapping and `update` then run for real,
   and the re-render (fed by the new Model → new props) is what you
   assert. Part-level behavior — keyboard handling, disabled clicks,
   roving focus — is the _kit's_ own headless-scene tests' job (see
   upstream `packages/ui-kit/test/Checkbox.test.ts`, which Scenes the
   headless component directly with a stand-in view). Our ports add no
   interaction handling of their own, so don't re-prove it.

2. **View-function ports are different.** The kit Switch (and Toggle,
   Button, …) is a view function: its parts are drawn in the consumer's
   own view layer, so `scene.fire(root, "click")` works and the toggle
   flows through `onToggle` → Message → Model → re-render, all in the
   Scene. Check the kit source: "headless component" ⇒ rule 1,
   "view function" ⇒ fire away.

3. **A disabled view-function part registers no handler at all** (native
   `<button disabled>` semantics). `scene.fire` then throws
   `nothing handles "click"` — that throw _is_ the Scene-level proof the
   control ignores clicks; wrap it in `assert.throws`, then assert the
   attrs didn't move. There is no message, so no `expectIgnored`.

4. **A Play is the escalation for a real click through a headless
   child.** `Play.make(C, props)` mounts on `TestHost` with the runtime
   running — children update for real, Commands resolve through Layers.
   Steps are Effects (`yield*` each) and the test pipes
   `Effect.provide(TestHost.layer())`. One Play per port is enough, for
   the end-to-end click the Scene can't do. Mind the difference in the
   acknowledgement rule: clicking a _disabled_ checkbox in a Play still
   produces the child's internal message (its update swallows it and
   emits nothing), so `expectIgnored()` _throws_ there — just assert the
   attrs didn't move. (In a browser, the native `disabled` attribute
   stops the click before any of this; TestHost dispatches the event
   itself.)

5. **Assert the D-5 bridge.** Ports write Radix's `data-state` from the
   controlled prop next to the kit's own flags (`data-checked`,
   `data-open`, …). Tests should pin both: `data-state` is what keeps
   upstream's `data-[state=…]` classes live, and it is derived from
   props, so it only changes when the consumer's Model does — which is
   exactly what the click/childEmit assertions prove.

## Coverage (wave 3, complete)

Every stateful port has a Scene test file following the recipe above,
with a Play wherever a real click through a headless child matters:
checkbox, switch, accordion, collapsible, tabs, toggle, toggle-group,
radio-group, dialog, alert-dialog, select, combobox, command, popover,
tooltip, hover-card, dropdown-menu, context-menu, menubar, slider,
input-otp, calendar, sidebar, sonner, form. Untestable-in-Scene behavior
(mount geometry, timers, focus, kit-internal updates) is declared in each
file's header, never faked.

Two assertion tightenings remain available for a future pass: tabs'
trigger/root classes and toggle-group's item/root classes are asserted
by prefix + ARIA surface because those ports don't export their class
constants; exporting them would allow strict equality like the others.
