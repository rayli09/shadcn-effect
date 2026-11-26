import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Scene } from "@effect/ui/testing";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { Toggle, toggleVariants } from "../registry/ui/toggle.ts";

// The consumer recipe (see tests/README.md): the kit Toggle is a view
// function, so the consumer Component owns `bold` in its Model, maps the
// port's onToggle to its own Message, and stores what it reports.
const EditorMessage = UiSchema.TaggedEnum({
  ToggledBold: { pressed: Schema.Boolean },
});

const Editor = Html.component({
  name: "Editor",
  props: Schema.Struct({
    disabled: Schema.optional(Schema.Boolean),
    outline: Schema.optional(Schema.Boolean),
  }),
  model: Schema.Struct({ bold: Schema.Boolean }),
  message: EditorMessage,
}).make({
  init: () => ({ bold: false }),
  update: {
    ToggledBold: ($, { pressed }) => $.evolve({ bold: pressed }),
  },
  view: (h, model) =>
    Toggle(h, {
      props: { pressed: model.bold, disabled: h.props.disabled },
      onToggle: ({ pressed }) => EditorMessage.ToggledBold({ pressed }),
      variant: h.props.outline === true ? "outline" : "default",
    }).children("B"),
});

const root = Locator.attr("data-slot", "toggle");

describe("Toggle (shadcn-effect port)", () => {
  it.effect("renders off: aria-pressed, the data-state bridge, and the upstream class", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(Editor, {});
      const attrs = scene.get(root).attrs;
      assert.strictEqual(attrs?.["aria-pressed"], "false");
      // The port writes Radix's data-state from the controlled prop (D-5),
      // alongside the kit's own pressed reporting.
      assert.strictEqual(attrs?.["data-state"], "off");
      // cn() with no extra class returns the upstream string verbatim.
      assert.strictEqual(attrs?.class, toggleVariants({}));
      scene.expect(root).toHaveText("B");
    }),
  );

  it.effect("a click flips the consumer Model, and the re-render shows on", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(Editor, {});
      // View-function port: the click handler lives in the consumer's own
      // view layer, so scene.fire drives the whole flow for real.
      scene.fire(root, "click");
      const attrs = scene.get(root).attrs;
      assert.strictEqual(attrs?.["aria-pressed"], "true");
      assert.strictEqual(attrs?.["data-state"], "on");
      assert.strictEqual(attrs?.["data-pressed"], "");
      scene.fire(root, "click");
      assert.strictEqual(scene.get(root).attrs?.["aria-pressed"], "false");
      assert.strictEqual(scene.get(root).attrs?.["data-state"], "off");
    }),
  );

  it.effect("the outline variant swaps in its upstream class string", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(Editor, { outline: true });
      assert.strictEqual(scene.get(root).attrs?.class, toggleVariants({ variant: "outline" }));
    }),
  );

  it.effect(
    "a disabled toggle ignores clicks: it renders disabled and exposes no click handler at all",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(Editor, { disabled: true });
        assert.strictEqual(scene.get(root).attrs?.disabled, "");
        assert.strictEqual(scene.get(root).attrs?.["data-disabled"], "");
        // The kit Toggle follows native <button disabled> semantics: with no
        // handler registered, a Scene fire is refused outright — no message
        // can be produced, so there is nothing to acknowledge.
        assert.throws(() => scene.fire(root, "click"), /nothing handles "click"/);
        assert.strictEqual(scene.get(root).attrs?.["aria-pressed"], "false");
        assert.strictEqual(scene.get(root).attrs?.["data-state"], "off");
      }),
  );
});
