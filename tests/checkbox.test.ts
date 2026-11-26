import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Locator, Play, Scene, TestHost } from "@effect/ui/testing";
import { Checkbox as KitCheckbox } from "@effect/ui-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { CHECKBOX_CLASS, CHECKBOX_INDICATOR_CLASS, Checkbox } from "../registry/ui/checkbox.ts";

// The consumer recipe (see tests/README.md): our ports are view functions
// over kit headless components, so a test defines the smallest consumer
// Component that owns the state — a Schema Model, a TaggedEnum Message the
// port's callback produces, an update that applies it, and a view that
// draws the port. The Scene then drives the rendered view.
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
      props: {
        checked: model.terms,
        disabled: h.props.disabled,
        name: "terms",
      },
      onToggle: ({ checked }) => TermsMessage.ToggledTerms({ checked }),
    }),
});

const root = Locator.attr("data-slot", "checkbox");
const indicator = Locator.attr("data-slot", "checkbox-indicator");

describe("Checkbox (shadcn-effect port)", () => {
  it.effect(
    "renders unchecked: role, aria-checked, the data-state bridge, and the upstream class",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(TermsForm, {});
        const attrs = scene.get(root).attrs;
        assert.strictEqual(attrs?.role, "checkbox");
        assert.strictEqual(attrs?.["aria-checked"], "false");
        // The port writes Radix's data-state from the controlled prop (D-5),
        // alongside the kit's own data-unchecked flag.
        assert.strictEqual(attrs?.["data-state"], "unchecked");
        assert.strictEqual(attrs?.["data-unchecked"], "");
        // cn() with no extra class returns the upstream string verbatim.
        assert.strictEqual(attrs?.class, CHECKBOX_CLASS);
        const indicatorAttrs = scene.get(indicator).attrs;
        assert.strictEqual(indicatorAttrs?.["data-state"], "unchecked");
        assert.strictEqual(indicatorAttrs?.class, CHECKBOX_INDICATOR_CLASS);
      }),
  );

  it.effect(
    "the child's Toggled event flips the consumer Model, and the re-render shows checked",
    () =>
      Effect.gen(function* () {
        const scene = yield* Scene.make(TermsForm, {});
        // A Scene never runs a child's update, so a click on the root — whose
        // only handler lives in the kit Checkbox's parts — is refused. The
        // Scene idiom is childEmit: stand in for what the child emits, and
        // the consumer's onEmit mapping + update run for real. (A real click
        // is the Play test below.)
        scene.childEmit(KitCheckbox, { _tag: "Toggled", checked: true });
        const attrs = scene.get(root).attrs;
        assert.strictEqual(attrs?.["aria-checked"], "true");
        assert.strictEqual(attrs?.["data-state"], "checked");
        assert.strictEqual(attrs?.["data-checked"], "");
        assert.isUndefined(attrs?.["data-unchecked"]);
        assert.strictEqual(scene.get(indicator).attrs?.["data-state"], "checked");
        // And back again: the port is controlled, so the next Toggled asks
        // for false and the consumer stores it.
        scene.childEmit(KitCheckbox, { _tag: "Toggled", checked: false });
        assert.strictEqual(scene.get(root).attrs?.["aria-checked"], "false");
        assert.strictEqual(scene.get(root).attrs?.["data-state"], "unchecked");
      }),
  );

  it.effect("a disabled checkbox renders disabled, on the root and the indicator", () =>
    Effect.gen(function* () {
      const scene = yield* Scene.make(TermsForm, { disabled: true });
      assert.strictEqual(scene.get(root).attrs?.disabled, "");
      assert.strictEqual(scene.get(root).attrs?.["data-disabled"], "");
      assert.strictEqual(scene.get(indicator).attrs?.["data-disabled"], "");
      assert.strictEqual(scene.get(root).attrs?.["aria-checked"], "false");
    }),
  );

  // A Play mounts the component on TestHost with the runtime running, so
  // the kit child's own update runs and a real click reaches it — the one
  // thing a Scene cannot do with a headless child.
  it.effect("a Play: a real click toggles, and a disabled checkbox ignores the click", () =>
    Effect.gen(function* () {
      const play = yield* Play.make(TermsForm, {});
      yield* play.click(root);
      yield* play.expect(root).toHaveAttribute("aria-checked", "true");
      yield* play.expect(root).toHaveAttribute("data-state", "checked");
      yield* play.click(root);
      yield* play.expect(root).toHaveAttribute("aria-checked", "false");

      const disabled = yield* Play.make(TermsForm, { disabled: true });
      yield* disabled.click(root);
      // No expectIgnored: the click does produce the child's internal
      // ClickedRoot message — its update swallows it (disabled), emits no
      // Toggled, and the consumer's Model never moves. In a browser the
      // native disabled attribute stops the click from arriving at all.
      yield* disabled.expect(root).toHaveAttribute("aria-checked", "false");
      yield* disabled.expect(root).toHaveAttribute("data-state", "unchecked");
    }).pipe(Effect.provide(TestHost.layer())),
  );
});
